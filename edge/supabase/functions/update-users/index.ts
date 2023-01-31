// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import { corsHeaders } from '../_shared/cors.ts';
import { LeetCode } from 'npm:leetcode-query';
import type {
  LeetCodeQuerySubmission,
  RecentSubmission,
  LCUser,
  UserSchema
} from '../_shared/types.ts';

console.log('Function "update-users" up and running!');

const lc = new LeetCode();

const getRecentAcceptedSubmission = async (username: string) => {
  const submissions: LeetCodeQuerySubmission[] = await lc.recent_submissions(
    username
  );
  return submissions.find(
    (submission) => submission.statusDisplay === 'Accepted'
  );
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('LOCAL_SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('LOCAL_SUPABASE_ANON_KEY') ?? '';
    const supabaseSecret =
      Deno.env.get('LOCAL_SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseSecret);

    const { data, error }: { data: UserSchema[] | null; error: any } =
      await supabase.from('UserData').select();

    const userData: UserSchema[] = data ?? [];

    const updatedUserData = await Promise.all(
      userData.map(async (user: UserSchema): Promise<UserSchema> => {
        const dayInMilliseconds = 24 * 60 * 60 * 1000;

        // Convert the string to use commas instead of dashes
        const lastSubmittedString = user.lastSubmitted.replace('-', ',');
        const lastUpdatedString = user.lastUpdated.replace('-', ',');

        // Clean user dates (submitted and updated times)
        let lastSubmittedFixed: Date = new Date(lastSubmittedString);

        let lastUpdatedFixed: Date = new Date(lastUpdatedString);

        const LeetCodeQuerySubmission: LeetCodeQuerySubmission | undefined =
          await getRecentAcceptedSubmission(user.username);

        if (typeof LeetCodeQuerySubmission === 'undefined') {
          return user;
        }

        // Convert recent submission timestamp to date
        const newSubmissionDate = new Date(
          Number(LeetCodeQuerySubmission?.timestamp) * 1000
        );

        const timestamp = new Date(newSubmissionDate);

        const recentSubmission: RecentSubmission = {
          ...LeetCodeQuerySubmission,
          timestamp: new Date(newSubmissionDate)
        };

        newSubmissionDate.setHours(0, 0, 0, 0);

        const today: number = new Date().setHours(0, 0, 0, 0);

        // More recent submission than last submission, update last submission timestamp
        if (newSubmissionDate > lastSubmittedFixed) {
          lastSubmittedFixed = newSubmissionDate;
          user.lastSubmitted = new Date(
            newSubmissionDate.getFullYear(),
            newSubmissionDate.getMonth(),
            newSubmissionDate.getDate()
          )
            .toISOString()
            .split('T')[0];
        }

        console.log(
          `${user.username}. Recent Submission: ${JSON.stringify(
            LeetCodeQuerySubmission
          )}`
        );

        // Submitted > 1 day ago -> Reset streak
        if (lastSubmittedFixed.valueOf() < today - dayInMilliseconds) {
          user.streak = 0;
        }

        // Didn't update yet today and submitted today -> Increment streak
        else if (
          lastUpdatedFixed.valueOf() < today &&
          lastSubmittedFixed.valueOf() === today
        ) {
          user.streak++;
          user.timestamp = timestamp.toISOString();
        }

        // Set submitted today if submitted today
        user.submittedToday = lastSubmittedFixed.valueOf() === today;

        user.lastUpdated = new Date(today).toISOString().split('T')[0];

        user = {
          ...user,
          ...recentSubmission,
          timestamp: timestamp.toISOString()
        };

        // Update the database entity
        const { error }: { error: any } = await supabase
          .from('UserData')
          .update({ ...user })
          .eq('id', user.id);

        return user;
      })
    );

    return new Response(JSON.stringify(updatedUserData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"userData": [{ "username": "ryanwong2000", "submittedToday": true, "streak": 7, "lastUpdated": "2023-01-13", "lastSubmitted": "2023-01-14" }]}'
