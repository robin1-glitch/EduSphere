
-- FORUM POSTS
CREATE TABLE public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 150),
  content text NOT NULL CHECK (char_length(content) BETWEEN 10 AND 5000),
  category text NOT NULL CHECK (category IN ('General','Courses help','Study tips','Projects','Announcements-feedback')),
  author_name text NOT NULL,
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','Locked','Hidden')),
  is_pinned boolean NOT NULL DEFAULT false,
  reply_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_posts TO anon, authenticated;
GRANT ALL ON public.forum_posts TO service_role;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Forum posts readable by all" ON public.forum_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Forum posts insertable (prototype)" ON public.forum_posts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Forum posts updatable (prototype)" ON public.forum_posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Forum posts deletable (prototype)" ON public.forum_posts FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX forum_posts_created_idx ON public.forum_posts (created_at DESC);

-- FORUM REPLIES
CREATE TABLE public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 2 AND 3000),
  author_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_replies TO anon, authenticated;
GRANT ALL ON public.forum_replies TO service_role;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Replies readable by all" ON public.forum_replies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Replies insertable (prototype)" ON public.forum_replies FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Replies updatable (prototype)" ON public.forum_replies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Replies deletable (prototype)" ON public.forum_replies FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX forum_replies_post_idx ON public.forum_replies (post_id, created_at);

-- Keep reply_count in sync automatically
CREATE OR REPLACE FUNCTION public.sync_forum_reply_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER forum_replies_count_trg
AFTER INSERT OR DELETE ON public.forum_replies
FOR EACH ROW EXECUTE FUNCTION public.sync_forum_reply_count();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER forum_posts_touch BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER forum_replies_touch BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 2000),
  author_name text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Approved','Pending','Hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_one_per_user_course UNIQUE (author_name, course_name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews readable by all" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Reviews insertable (prototype)" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Reviews updatable (prototype)" ON public.reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Reviews deletable (prototype)" ON public.reviews FOR DELETE TO anon, authenticated USING (true);

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 150),
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 5000),
  category text NOT NULL CHECK (category IN ('Update','Event','Maintenance')),
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO anon, authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements readable by all" ON public.announcements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Announcements insertable (prototype)" ON public.announcements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Announcements updatable (prototype)" ON public.announcements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Announcements deletable (prototype)" ON public.announcements FOR DELETE TO anon, authenticated USING (true);

-- CONTACT MESSAGES (write-only from the site)
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 255),
  subject text NOT NULL CHECK (subject IN ('General question','Course support','Technical issue','Account help','Partnership','Feedback')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 20 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a contact message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- FAQ ITEMS (read-only)
CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL CHECK (group_name IN ('Getting started','Courses','Assessments','Account','Community')),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.faq_items TO anon, authenticated;
GRANT ALL ON public.faq_items TO service_role;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ readable by all" ON public.faq_items FOR SELECT TO anon, authenticated USING (true);

-- ===== SEED DATA =====
INSERT INTO public.forum_posts (id, title, content, category, author_name, status, is_pinned, created_at) VALUES
('10000000-0000-4000-8000-000000000001','Welcome to the EduSphere community — read this first','Hi everyone! This is the place to ask questions, share study tips and show off your projects. Please be kind, stay on topic and search before posting. Moderators may lock or hide threads that break the guidelines.','General','Sita Karki','Locked',true, now() - interval '30 days'),
('10000000-0000-4000-8000-000000000002','How do you stay consistent with daily study?','I keep starting strong and then skipping days. What routines or tools help you study a little every day without burning out?','Study tips','Anita Gurung','Open',true, now() - interval '2 days'),
('10000000-0000-4000-8000-000000000003','Stuck on Python loops exercise 4','In Introduction to Python, exercise 4 asks to print a triangle of stars. My loop prints everything on one line. Any hints without giving away the full answer?','Courses help','Rohan Shrestha','Open',false, now() - interval '5 hours'),
('10000000-0000-4000-8000-000000000004','Show and tell: my first portfolio website','I just finished Web Development Fundamentals and built a small portfolio site with HTML and CSS. Feedback on layout and accessibility is very welcome!','Projects','Priya Rai','Open',false, now() - interval '1 day'),
('10000000-0000-4000-8000-000000000005','Suggestion: dark mode for lesson pages','Reading long lessons at night is hard on the eyes. Would the team consider a dark reading mode? Happy to help test it.','Announcements-feedback','Kiran Thapa','Open',false, now() - interval '3 days'),
('10000000-0000-4000-8000-000000000006','Best way to take notes during video lessons?','Do you pause and write, or watch first and summarise after? Looking for a method that actually helps with quizzes.','Study tips','Maya Lama','Open',false, now() - interval '4 days'),
('10000000-0000-4000-8000-000000000007','Excel pivot tables not refreshing','In Data Analysis with Excel, lesson 6, my pivot table does not update after I add new rows. What am I missing?','Courses help','Bikash Adhikari','Open',false, now() - interval '6 days'),
('10000000-0000-4000-8000-000000000008','Looking for a study partner for Spanish for Beginners','I am in week 2 and would love someone to practise short conversations with twice a week. Time zone UTC+5:45.','General','Anita Gurung','Open',false, now() - interval '7 days'),
('10000000-0000-4000-8000-000000000009','UI Design Basics — color contrast tool recommendations','Which free tools do you use to check WCAG contrast while designing? I am preparing the final assignment.','Courses help','Priya Rai','Open',false, now() - interval '9 days'),
('10000000-0000-4000-8000-000000000010','Group project idea: campus events app','Anyone interested in building a small events app together after the web course? I can handle the design side.','Projects','Kiran Thapa','Open',false, now() - interval '11 days'),
('10000000-0000-4000-8000-000000000011','Free course giveaway link (spam)','Click this link to get every course for free!!!','General','Unknown user','Hidden',false, now() - interval '12 days'),
('10000000-0000-4000-8000-000000000012','Thanks for the new quiz feedback screen','The new screen that explains wrong answers is really helpful. Great update, team!','Announcements-feedback','Maya Lama','Open',false, now() - interval '14 days');

INSERT INTO public.forum_replies (post_id, content, author_name, created_at) VALUES
('10000000-0000-4000-8000-000000000002','I set a tiny goal: one lesson or 15 minutes, whichever comes first. Most days I end up doing more.','Rohan Shrestha', now() - interval '1 day 20 hours'),
('10000000-0000-4000-8000-000000000002','Study at the same time every day. Habit stacking with my morning tea works for me.','Maya Lama', now() - interval '1 day 10 hours'),
('10000000-0000-4000-8000-000000000002','The progress tracker streak keeps me honest!','Priya Rai', now() - interval '20 hours'),
('10000000-0000-4000-8000-000000000003','Hint: look at the end parameter of print(). By default it adds a newline — check what you passed.','Bikash Adhikari', now() - interval '3 hours'),
('10000000-0000-4000-8000-000000000003','Also make sure the inner loop is inside the outer loop (indentation matters in Python).','Sita Karki', now() - interval '2 hours'),
('10000000-0000-4000-8000-000000000004','Looks clean! Consider adding alt text to the project screenshots.','Maya Lama', now() - interval '20 hours'),
('10000000-0000-4000-8000-000000000004','Nice work. The nav links could use a visible focus style for keyboard users.','Kiran Thapa', now() - interval '18 hours'),
('10000000-0000-4000-8000-000000000005','+1, would love this.','Anita Gurung', now() - interval '2 days'),
('10000000-0000-4000-8000-000000000005','Thanks for the suggestion — we have added it to our roadmap.','Sita Karki', now() - interval '2 days 2 hours'),
('10000000-0000-4000-8000-000000000006','Watch once at 1.25x, then rewatch the hard parts and write questions, not answers.','Rohan Shrestha', now() - interval '3 days'),
('10000000-0000-4000-8000-000000000007','Right-click the pivot and choose Refresh, or convert your data to a Table so the range grows automatically.','Priya Rai', now() - interval '5 days'),
('10000000-0000-4000-8000-000000000007','That fixed it, thank you!','Bikash Adhikari', now() - interval '5 days 2 hours'),
('10000000-0000-4000-8000-000000000008','Count me in! Tuesdays and Fridays work for me.','Kiran Thapa', now() - interval '6 days'),
('10000000-0000-4000-8000-000000000009','WebAIM contrast checker is simple and free.','Maya Lama', now() - interval '8 days'),
('10000000-0000-4000-8000-000000000009','Figma also has contrast plugins that check while you design.','Anita Gurung', now() - interval '8 days'),
('10000000-0000-4000-8000-000000000010','I can help with the front end. Let us plan after exams.','Rohan Shrestha', now() - interval '10 days'),
('10000000-0000-4000-8000-000000000012','Agreed, it made revising so much easier.','Priya Rai', now() - interval '13 days');

INSERT INTO public.reviews (course_name, rating, comment, author_name, status, created_at) VALUES
('Introduction to Python', 5, 'Clear explanations and the practice quizzes really helped me understand loops and functions.', 'Rohan Shrestha', 'Approved', now() - interval '3 days'),
('Introduction to Python', 4, 'Great pace for beginners. I would love a few more real-world mini projects.', 'Maya Lama', 'Approved', now() - interval '8 days'),
('Web Development Fundamentals', 5, 'I built my first website by the end. The accessibility lesson was eye-opening.', 'Priya Rai', 'Approved', now() - interval '2 days'),
('Web Development Fundamentals', 4, 'Solid content. CSS grid section could use one more example.', 'Kiran Thapa', 'Approved', now() - interval '12 days'),
('Business Communication', 4, 'Practical tips for emails and presentations that I used at work the same week.', 'Bikash Adhikari', 'Approved', now() - interval '15 days'),
('Business Communication', 3, 'Useful, but some videos felt long. Shorter lessons would help.', 'Anita Gurung', 'Approved', now() - interval '20 days'),
('UI Design Basics', 5, 'Loved the hands-on assignments and the feedback on color contrast.', 'Anita Gurung', 'Approved', now() - interval '5 days'),
('UI Design Basics', 4, 'Friendly instructor and well-structured modules.', 'Maya Lama', 'Pending', now() - interval '1 day'),
('Data Analysis with Excel', 5, 'Pivot tables finally make sense! The step-by-step videos are excellent.', 'Bikash Adhikari', 'Approved', now() - interval '6 days'),
('Data Analysis with Excel', 2, 'Content is fine but the sample files were hard to find.', 'Kiran Thapa', 'Approved', now() - interval '25 days'),
('Spanish for Beginners', 4, 'Fun speaking exercises. I can introduce myself confidently now.', 'Priya Rai', 'Approved', now() - interval '9 days'),
('Spanish for Beginners', 1, 'Buy cheap followers at my website!!!', 'Unknown user', 'Hidden', now() - interval '10 days'),
('Foundations of Physics', 5, 'The simulations made motion and forces easy to picture.', 'Rohan Shrestha', 'Approved', now() - interval '4 days'),
('Foundations of Physics', 3, 'Good overview, though the maths parts went quickly.', 'Maya Lama', 'Pending', now() - interval '6 hours');

INSERT INTO public.announcements (title, body, category, is_pinned, created_at) VALUES
('New course: Foundations of Physics is live', 'Explore motion, energy and forces with interactive simulations and short quizzes after every lesson. Enroll from the Courses page — it is free for all registered learners.', 'Update', true, now() - interval '1 day'),
('Scheduled maintenance on Saturday', 'EduSphere will be unavailable on Saturday from 02:00 to 04:00 UTC while we upgrade our servers. Your progress is saved automatically and will not be affected.', 'Maintenance', true, now() - interval '2 days'),
('Live Q&A: How to study smarter', 'Join our learning coach for a 45-minute live session on spaced repetition, note-taking and staying motivated. Bring your questions — the recording will be shared afterwards.', 'Event', false, now() - interval '3 days'),
('Quiz feedback screen improved', 'After each quiz you now see a clear explanation for every answer, plus links back to the lesson that covers it. Thank you to everyone who shared feedback in the forum.', 'Update', false, now() - interval '6 days'),
('Community guidelines refreshed', 'We updated the community guidelines to make expectations clearer. Please be respectful, stay on topic and report posts that break the rules.', 'Update', false, now() - interval '9 days'),
('Project showcase week', 'Share what you have built in the Projects category of the forum this week. Selected projects will be featured on the home page.', 'Event', false, now() - interval '12 days'),
('Short downtime for video player update', 'Video lessons may briefly fail to load on Tuesday evening while we roll out a faster player. Refresh the page if a lesson does not start.', 'Maintenance', false, now() - interval '15 days'),
('Spanish speaking club starts next month', 'Practise conversation with other learners in friendly small groups every Wednesday. Sign-up details will be posted in the community forum.', 'Event', false, now() - interval '18 days'),
('Progress tracker now shows weekly goals', 'Set a weekly learning goal and see your streak on the progress page. Small, steady steps add up!', 'Update', false, now() - interval '22 days'),
('Mobile layout improvements', 'Lessons and quizzes are now easier to use on phones, with larger buttons and better text spacing.', 'Update', false, now() - interval '26 days'),
('Database maintenance completed', 'Last weekend''s maintenance finished on time. Thank you for your patience.', 'Maintenance', false, now() - interval '30 days'),
('Welcome to EduSphere!', 'We are excited to launch EduSphere — a simple place to learn, practise and grow. Explore the courses, join the community and tell us what you think.', 'Event', false, now() - interval '45 days');

INSERT INTO public.faq_items (group_name, question, answer, sort_order) VALUES
('Getting started','What is EduSphere?','EduSphere is an e-learning platform where you can take courses at your own pace, practise with quizzes, track your progress and learn with a supportive community.',1),
('Getting started','Is EduSphere free to use?','Creating an account and browsing courses is free. Most beginner courses are free; some advanced courses may require enrollment approval.',2),
('Getting started','How do I create an account?','Select "Register" in the top navigation, fill in your name, email and a password, then confirm your email address.',3),
('Courses','How do I enroll in a course?','Open the course page and select "Enroll in course". It will then appear in your learner dashboard.',1),
('Courses','Can I learn at my own pace?','Yes. Lessons are available any time, and your progress is saved automatically so you can continue where you left off.',2),
('Courses','Do I get a certificate?','Courses that include a final assessment award a certificate when you pass it.',3),
('Assessments','How do quizzes work?','Each lesson can include a short quiz. You see your score straight away along with an explanation for each answer.',1),
('Assessments','Can I retake a quiz?','Yes, practice quizzes can be retaken as many times as you like. Final assessments may have a limited number of attempts.',2),
('Assessments','What score do I need to pass?','Most assessments require 70% to pass. The required score is shown before you start.',3),
('Account','I forgot my password. What should I do?','On the log in page, select "Forgot password" and follow the link sent to your email to set a new password.',1),
('Account','How do I change my email address?','Go to your account settings, update your email and confirm the change from the message we send you.',2),
('Account','Can I delete my account?','Yes. You can request account deletion from your account settings. Your learning history will be removed permanently.',3),
('Community','Who can post in the forum?','Anyone can read the forum. You need to log in to start a discussion, reply or write a course review.',1),
('Community','Why was my post hidden or locked?','Moderators may hide posts that break the community guidelines or lock threads once a question is resolved.',2),
('Community','How do I report inappropriate content?','Use the contact form with the subject "Feedback" and include a link to the post. Our moderators will review it.',3),
('Community','Are course reviews moderated?','Yes. New reviews are checked by an admin before they appear publicly, usually within one working day.',4);
