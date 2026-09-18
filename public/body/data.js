/* Curated routes, not prerequisite gates. A stage may contain alternative variations.
   Stable IDs are persistence keys; changing a display name does not change progress. */
(function (root) {
  const paths = [];
  function path(id, name, group, equipment, description, stages, related = []) {
    paths.push({ id, name, group, equipment, description, related,
      stages: stages.map((stage, i) => (Array.isArray(stage) ? stage : [stage]).map(item => {
        const [key, label, cue] = item.split('|');
        return { id: id + ':' + key, name: label, cue, stage: i };
      })) });
  }
  path('pull-up','Pull-up','Pull','Bar or rings','Build controlled vertical pulling, from assisted movement to a one-arm pull-up.',[
    'active|Active hang|Hang with straight elbows and gently draw the shoulders away from the ears.',
    'scapular|Scapular pull-up|With elbows straight, raise and lower the body through shoulder-blade movement.',
    ['assisted|Assisted pull-up|Use a band or foot support to pull through a comfortable full range.','negative|Pull-up negative|Start above the bar and lower under control; use assistance to return to the top.'],
    'pullup|Pull-up|Start from a controlled hang and bring the chin above the bar without kicking.',
    ['chest|Chest-to-bar pull-up|Pull higher while keeping the torso controlled.','lsit|L-sit pull-up|Maintain legs extended in front while completing the pull.'],
    'archer|Archer pull-up|Shift toward one hand while the other arm provides progressively less help.',
    'one-assisted|Assisted one-arm pull-up|Use measurable assistance while pulling primarily with one arm.',
    'one|One-arm pull-up|Pull from a controlled hang using one arm, without a jump or swing.'
  ],['rows','muscle-up']);
  path('rows','Bodyweight row','Pull','Low bar or rings','A horizontal pulling path. Change body angle before chasing harder arm variations.',[
    'standing|Upright row|Lean back from rings or a bar with the body fairly upright; pull the chest toward the hands.',
    'incline|Incline row|Lower the body angle while maintaining a straight line from shoulders to feet.',
    'row|Horizontal row|Pull the chest to the hands with the torso close to horizontal.',
    'feet|Feet-elevated row|Elevate the feet while keeping the hips level and the same controlled range.',
    'archer|Archer row|Pull toward one hand while extending the other arm for assistance.',
    'one-assisted|Assisted one-arm row|Use the second hand lightly and keep the torso from rotating.',
    'one|One-arm row|Row with one arm at your chosen body angle, with controlled shoulders and hips.'
  ],['front-lever','pull-up']);
  path('front-lever','Front lever','Pull','Bar or rings','Build a straight-arm horizontal hold by gradually lengthening the body lever.',[
    'tuck|Tuck front lever|With elbows straight, hold the back roughly horizontal and knees tucked toward the chest.',
    'advanced|Advanced tuck front lever|Open the hips away from the chest while keeping a flat, horizontal back.',
    ['one|One-leg front lever|Extend one leg while keeping the other tucked; practice both sides.','straddle|Straddle front lever|Straighten both legs and separate them to shorten the effective lever.'],
    'full|Full front lever|Hold the body horizontal, legs together and straight, without bending the elbows.'
  ],['rows','pull-up']);
  path('back-lever','Back lever','Pull','Rings or bar','A straight-arm hold with the chest facing down. Shoulder preparation matters more than a shortcut through levels.',[
    'skin|Controlled skin the cat|Rotate slowly through a comfortable shoulder range using foot support as needed.',
    'tuck|Tuck back lever|Hold a tucked horizontal position with straight arms and controlled shoulders.',
    'advanced|Advanced tuck back lever|Open the hips while maintaining a stable shoulder position.',
    ['one|One-leg back lever|Extend one leg; train both sides without twisting.','straddle|Straddle back lever|Extend and separate the legs while maintaining the horizontal torso.'],
    'full|Back lever|Hold a straight, horizontal body with the chest facing down.'
  ],['front-lever','iron-cross']);
  path('muscle-up','Muscle-up','Pull','Bar or rings','Combine pulling, a transition, and support. Pull-ups and dips are supporting paths, not automatic unlocks.',[
    'transition|Feet-assisted transition|Use low rings and foot support to practice moving from below the rings to above them.',
    'negative|Muscle-up negative|Lower slowly from support through the transition with assistance when needed.',
    ['ring|Strict ring muscle-up|Pull and transition smoothly into ring support without a kip.','bar|Strict bar muscle-up|Pull high enough to transition over the bar and press into support without kicking.'],
    'lsit|L-sit ring muscle-up|Keep the legs extended forward through the pull, transition, and press.'
  ],['pull-up','dips']);
  path('push-up','Push-up','Push','Floor; raised surface','Build horizontal pressing and gradually shift more load onto one arm.',[
    'wall|Wall push-up|Keep a straight body and lower the chest toward a wall.',
    'incline|Incline push-up|Use a sturdy raised surface and lower the chest between the hands.',
    'full|Push-up|Move the shoulders and hips together through a controlled range.',
    ['diamond|Close-grip push-up|Bring the hands closer while keeping a comfortable wrist and elbow position.','rings|Ring push-up|Stabilize the rings while lowering and pressing with a rigid torso.'],
    'archer|Archer push-up|Lower toward one hand while the opposite arm provides assistance.',
    'one-incline|Incline one-arm push-up|Use one arm on a raised surface and resist torso rotation.',
    'one|One-arm push-up|Lower and press on one arm with controlled hips; stance width changes difficulty.'
  ],['planche','handstand-push-up']);
  path('dips','Dip','Push','Parallel bars; rings for ring variations','Develop support and deep pressing control before adding ring instability.',[
    'support|Parallel-bar support|Hold the body above the bars with straight elbows and stable shoulders.',
    'assisted|Assisted dip|Use foot or band assistance through a comfortable shoulder range.',
    'dip|Parallel-bar dip|Lower and press without swinging, keeping a depth you can control.',
    'ring-support|Ring support|Hold straight-arm support on rings without letting them drift outward.',
    'ring|Ring dip|Keep the rings close and stable through the lowering and pressing phases.',
    'rto|Rings-turned-out dip|Add controlled outward ring rotation; increase the angle gradually.'
  ],['muscle-up','iron-cross']);
  path('handstand','Handstand','Push','Floor and wall','This path develops balance and alignment. Pressing strength has its own path.',[
    'plank|Wall plank|Walk the feet up a wall only as far as you can maintain control and exit comfortably.',
    'wall|Chest-to-wall handstand|Stack hands, shoulders, and hips with a light wall contact and straight elbows.',
    'balance|Wall balance drills|Briefly float the feet away from the wall using small finger and shoulder adjustments.',
    'free|Freestanding handstand|Balance away from the wall with a controlled entry and exit.',
    'weight|Handstand weight shifts|Shift weight between hands while maintaining alignment.',
    'one-assisted|Assisted one-arm handstand|Use light fingertip support from the other hand as you balance.',
    'one|One-arm handstand|Balance on one hand without assistance.'
  ],['handstand-push-up']);
  path('handstand-push-up','Handstand push-up','Push','Floor, wall; parallettes optional','Build overhead pressing. A freestanding handstand is a separate balance skill.',[
    'pike|Pike push-up|With hips high, lower the head forward between the hands and press back up.',
    'elevated|Feet-elevated pike push-up|Elevate the feet and bring more bodyweight over the hands.',
    'negative|Wall handstand push-up negative|Lower under control from a wall-supported handstand; use a safe, controlled exit.',
    'partial|Partial wall handstand push-up|Press through a range you can control and gradually increase depth.',
    'wall|Wall handstand push-up|Lower and press with wall assistance and no leg drive.',
    ['deficit|Deficit wall handstand push-up|Use stable parallettes to increase the controlled pressing range.','free|Freestanding handstand push-up|Combine the press with freestanding balance throughout the movement.']
  ],['handstand','push-up']);
  path('planche','Planche','Push','Floor or parallettes','Progressively support more of the body in front of the hands with straight arms.',[
    'lean|Planche lean|Keep elbows straight and lean shoulders forward of the hands while the feet remain supported.',
    'tuck|Tuck planche|Lift the feet in a tucked position while keeping elbows straight.',
    'advanced|Advanced tuck planche|Open the hips while maintaining straight elbows and a level torso.',
    ['straddle|Straddle planche|Extend and separate the legs while holding the body off the floor.','one|One-leg planche|Extend one leg and keep the other tucked; practice both sides.'],
    'full|Full planche|Hold the body horizontal with legs together and straight arms.'
  ],['push-up','planche-push-up']);
  path('planche-push-up','Planche push-up','Push','Floor or parallettes','A bent-arm pressing path related to, but distinct from, the planche hold.',[
    'pseudo|Pseudo planche push-up|Keep shoulders forward of the hands while pressing with feet on the floor.',
    'tuck|Tuck planche push-up|Lower and press with the feet lifted and knees tucked.',
    'advanced|Advanced tuck planche push-up|Open the hips while maintaining control through the press.',
    'straddle|Straddle planche push-up|Press with legs extended and apart, without touching the feet down.',
    'full|Planche push-up|Press with a straight body and feet unsupported.'
  ],['planche']);
  path('elbow-lever','Elbow lever','Push','Floor or parallettes','A balance path using bent-arm support. It is not a prerequisite for a straight-arm planche.',[
    'frog|Frog stand|Balance with bent elbows and knees supported on the upper arms.',
    'straddle|Straddle elbow lever|Support the torso on bent elbows with legs extended and apart.',
    'full|Elbow lever|Balance horizontally with the legs together and elbows supporting the torso.',
    'one-assisted|Assisted one-arm elbow lever|Shift onto one elbow with light support from the other hand.',
    'one|One-arm elbow lever|Balance with the torso supported by one elbow.'
  ],['handstand']);
  path('l-sit','L-sit & V-sit','Core','Parallettes, bars or floor','Combine straight-arm support, compression, and leg extension.',[
    'supported|Foot-supported L-sit|Press down through the hands and unload the feet while keeping straight elbows.',
    'tuck|Tuck L-sit|Lift both feet with knees tucked and shoulders held down.',
    'one|One-leg L-sit|Extend one leg while keeping the other bent; practice both sides.',
    'full|L-sit|Hold both legs straight and roughly horizontal with feet off the floor.',
    'high|High L-sit|Lift the straight legs above horizontal while maintaining straight-arm support.',
    'v|V-sit|Compress the legs toward the torso into a V-shaped hold.',
    'manna|Manna|An advanced extension of this family, with the hips lifted and shoulders moving behind the hands; requires dedicated preparation.'
  ],['leg-raise']);
  path('leg-raise','Hanging leg raise','Core','Pull-up bar','Control the pelvis and raise the legs without using swing.',[
    'knees|Hanging knee raise|Raise bent knees while controlling the hang and reducing swing.',
    'high-knees|Knees to chest|Curl the pelvis upward as the knees approach the chest.',
    'straight|Straight-leg raise|Lift straight legs toward horizontal without kicking.',
    'toes|Toes to bar|Raise the straight legs toward the bar using controlled abdominal and hip movement.',
    'weighted|Weighted hanging leg raise|Add a small external load while preserving the same controlled range.'
  ],['l-sit','dragon-flag']);
  path('rollout','Ab wheel rollout','Core','Ab wheel; wall optional','Increase anti-extension strength by reaching farther without losing trunk control.',[
    'plank|Forearm plank|Maintain a comfortable neutral trunk without sagging through the lower back.',
    'partial|Partial kneeling rollout|Roll a short distance from the knees while keeping the trunk controlled.',
    'kneeling|Kneeling rollout|Increase the reach while returning without collapsing or hinging sharply at the hips.',
    'wall|Wall-limited standing rollout|From standing, use a wall to limit wheel travel; move farther away gradually.',
    'standing|Standing rollout|Roll out and return from the feet with controlled trunk position.'
  ],['dragon-flag']);
  path('dragon-flag','Dragon flag','Core','Secure bench or anchor','Extend the body lever while supporting through the upper back, not the neck.',[
    'tuck-negative|Tuck dragon flag negative|Lower the tucked body slowly while keeping weight off the neck.',
    'tuck|Tuck dragon flag|Raise and lower in a tucked position with control through the trunk.',
    'advanced|Advanced tuck dragon flag|Open the hips to lengthen the lever without losing alignment.',
    ['one|One-leg dragon flag|Extend one leg and train both sides.','straddle|Straddle dragon flag|Extend both legs apart to bridge toward a full straight-body movement.'],
    'full|Dragon flag|Raise and lower the straight body while supported through the upper back.'
  ],['leg-raise','rollout']);
  path('pistol','Pistol squat','Legs','Floor; support or counterweight','Develop single-leg squat strength, balance, and a usable range of motion.',[
    'assisted-squat|Assisted squat|Use a sturdy support while sitting down between the hips.',
    'squat|Bodyweight squat|Squat through a controlled range while keeping the feet stable.',
    'split|Split squat|Lower and rise with a staggered stance and most load through the front leg.',
    'bulgarian|Rear-foot-elevated split squat|Elevate the rear foot and control the descent through the front leg.',
    ['partial|Box pistol squat|Sit to a box on one leg and gradually reduce box height.','assisted|Assisted pistol squat|Use hand support or a counterweight to explore the full single-leg range.'],
    'full|Pistol squat|Squat on one leg with the other leg held forward, then return under control.'
  ],['shrimp','nordic']);
  path('shrimp','Shrimp squat','Legs','Floor; pad optional','A single-leg squat family with the free leg behind the body.',[
    'step|Step-up|Step onto a stable platform with minimal push from the trailing leg.',
    'deep|High step-up|Use a taller platform while keeping the working knee and hip controlled.',
    'beginner|Assisted shrimp squat|Keep the free leg behind and use hand support to control depth.',
    'full|Shrimp squat|Lower the rear knee toward a pad with the free leg bent behind you.',
    'held|Foot-held shrimp squat|Hold the rear foot to reduce assistance from the free leg.',
    'elevated|Elevated shrimp squat|Stand on a platform to increase the available range of motion.'
  ],['pistol']);
  path('nordic','Nordic curl','Legs','Secure ankle anchor and knee padding','Build knee-flexion strength. A stable ankle anchor is essential.',[
    'bridge|Hamstring bridge|Press through the heels and lift the hips with controlled hamstring tension.',
    'partial|Partial Nordic negative|With ankles securely anchored, lower a short distance while keeping hips extended.',
    'negative|Nordic curl negative|Lower farther under control and use the hands to assist the return.',
    'assisted|Assisted Nordic curl|Use a band or hand assistance through the lowering and lifting phases.',
    'full|Nordic curl|Lower and return with minimal hip bending and no push from the hands.'
  ],['pistol']);
  path('bridge','Bridge','Mobility','Floor; elevated support optional','A mobility and strength path. Range is individual; this is not an overall fitness level.',[
    'shoulder|Shoulder bridge|Lift the hips with shoulders and feet supported on the floor.',
    'table|Table bridge|Support on hands and feet with bent knees and lift the hips.',
    'elevated|Elevated-hand bridge|Place hands on a sturdy raised surface and explore a comfortable overhead opening.',
    'full|Full bridge|Press into a bridge through a comfortable shoulder, spine, and hip range.',
    'one|One-leg bridge|Lift one leg while maintaining a stable bridge; practice both sides.'
  ],['handstand']);
  path('human-flag','Human flag','Core','Secure vertical pole or stall bars','Combine a pulling top arm and pushing bottom arm with lateral trunk strength.',[
    'support|Flag support|Practice opposing arm forces with feet supported and a stable shoulder position.',
    'vertical|Vertical flag|Use a more upright supported body position to practice straight-arm control.',
    'tuck|Tuck human flag|Lift the feet and hold the body sideways with knees tucked.',
    'advanced|Advanced tuck human flag|Open the hips while maintaining opposing straight-arm forces.',
    'straddle|Straddle human flag|Extend and separate the legs while holding the body sideways.',
    'full|Human flag|Hold a straight horizontal body sideways from the support.'
  ],['pull-up','handstand-push-up']);
  path('iron-cross','Iron cross','Push','Gymnastics rings and assistance','An advanced ring specialization. Support and tendon preparation belong alongside the progression.',[
    'support|Rings-turned-out support|Hold a stable straight-arm support with the rings turned outward.',
    'feet|Feet-assisted cross|Use substantial foot support while slowly exploring the cross position.',
    'assisted|Assisted iron cross|Use a controlled assistance setup to reduce load through the entire hold.',
    'negative|Assisted cross negative|Lower from support toward the cross with assistance and deliberate control.',
    'full|Iron cross|Hold the body upright with straight arms extended horizontally to the sides.'
  ],['dips','back-lever']);
  root.BODY_PATHS = paths;
  if (typeof module !== 'undefined') module.exports = paths;
})(typeof window !== 'undefined' ? window : globalThis);
