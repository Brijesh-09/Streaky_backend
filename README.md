This will act as a backend for our Khel application .


Streak Logic .
-Increment only when the delta b/w contributions is (23 24)
-Resets to 0 if the delta b/w contributions is > 24

Edge case need to be checked .
1: Streak should be updated once withhin 24 hrs of contributions it could be done using the time when the contribution is added is within 24 hrs and when did the streak was last  updated
 (streak should be updated once in every 24 hrs if the contributions exist with 24 hrs from the time when the streak was updated )

 2: Streak should be update when contributions is made within 24hrs && streak should be updated once in 24 hrs 
 Streak should be incremented once in 24 hrs when the contribution is added & if time between last two contributions is > 24 hrs it should reset.

 --
 CORRECT SCENARIOS:

Day 1: Contribution at 2:00 PM → streak = 1
       Additional contribution at 4:00 PM → streak stays 1 (within same 24h)
Day 2: Contribution at 3:00 PM → streak = 2 (good: between 24-48h)
Day 3: Contribution at 1:00 PM → streak = 3 (good: between 24-48h)

STREAK BREAKING:
Day 1: Contribution at 2:00 PM → streak = 1
Day 3: Contribution at 3:00 PM → streak resets to 1 (gap > 48h)

TOO EARLY:
Day 1: Contribution at 2:00 PM → streak = 1
Day 2: Contribution at 10:00 AM → too early, streak stays 1
       Next valid window starts at 2:00 PM

--