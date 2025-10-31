-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  points INTEGER NOT NULL,
  problem_statement TEXT NOT NULL,
  test_cases JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge_attempts table
CREATE TABLE public.challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT,
  language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge_participants table for friend challenges
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.challenge_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attempt_id, user_id)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges (public read)
CREATE POLICY "Anyone can view challenges"
  ON public.challenges FOR SELECT
  USING (true);

-- RLS Policies for challenge_attempts
CREATE POLICY "Users can view their own attempts"
  ON public.challenge_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
  ON public.challenge_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
  ON public.challenge_attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for challenge_participants
CREATE POLICY "Users can view participants of their challenges"
  ON public.challenge_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.challenge_attempts
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to their challenges"
  ON public.challenge_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.challenge_attempts
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

-- Insert some sample challenges
INSERT INTO public.challenges (title, description, difficulty, points, problem_statement, test_cases) VALUES
  ('Two Sum Problem', 'Find two numbers that add up to a target sum', 'Easy', 100, 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', '{"input": "[2,7,11,15], 9", "output": "[0,1]"}'),
  ('Binary Tree Traversal', 'Implement in-order traversal of a binary tree', 'Medium', 200, 'Given the root of a binary tree, return the inorder traversal of its nodes'' values.', '{"input": "[1,null,2,3]", "output": "[1,3,2]"}'),
  ('Dynamic Programming - Knapsack', 'Solve the 0/1 knapsack problem', 'Hard', 300, 'Given weights and values of n items, put these items in a knapsack of capacity W to get the maximum total value.', '{"input": "values=[60,100,120], weights=[10,20,30], W=50", "output": "220"}'),
  ('String Manipulation', 'Reverse words in a string', 'Easy', 100, 'Given an input string s, reverse the order of the words.', '{"input": "the sky is blue", "output": "blue is sky the"}');