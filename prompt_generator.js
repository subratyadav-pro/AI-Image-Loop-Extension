// ─── Flame Emperor (BTTH Sequel / The Great Ruler) Storyboard ───
const FLAME_EMPEROR_CANON_FRAMES = [
  // Frame 1: The Dimensional Ascension
  "make an image of 3D Chinese Donghua anime scene frame #1 of BTTH Flame Emperor novel: Xiao Yan wearing supreme black Dou Di imperial robes embroidered with golden dragon patterns, standing before the opening dimensional vortex of the Dou Qi continent, holding the Heavy Xuan Ruler wrapped in burning cosmic green lotus fire, soaring into the sky as millions of cultivators bow, cinematic donghua 3D render, Tencent anime aesthetic, volumetric god rays, 8k resolution",

  // Frame 2: Journeying Across the Cosmic Void
  "make an image of 3D Chinese Donghua anime scene frame #2 of BTTH Flame Emperor novel: Xiao Yan traveling across the boundless dimensional passage between worlds, surrounded by turbulent spatial storms and cosmic nebulae, 22 colored Heavenly Flames swirling around his body creating an impenetrable prismatic flame shield, breathtaking celestial lighting, 8k render",

  // Frame 3: Arrival at the Great Thousand World
  "make an image of 3D Chinese Donghua anime scene frame #3 of BTTH Flame Emperor novel: Xiao Yan landing like a radiant solar meteor upon the colossal mountain peaks of the Great Thousand World, immense waves of spiritual energy rippling through ancient floating continents, his eyes shining with burning confidence, epic cinematic camera angle, 8k",

  // Frame 4: Confrontation at the Fire Spirit Clan
  "make an image of 3D Chinese Donghua anime scene frame #4 of BTTH Flame Emperor novel: Xiao Yan confronting the ancient elders and Supreme Patriarch of the Fire Spirit Clan atop a massive active volcano caldera, summoning a giant palm of multi-colored Heavenly Flame that dwarfs the mountain, awe-inspiring scale, dramatic rim lighting",

  // Frame 5: Subduing the Ancestral Holy Flame
  "make an image of 3D Chinese Donghua anime scene frame #5 of BTTH Flame Emperor novel: Xiao Yan assimilating the Fire Spirit Clan's ancient holy ancestral flame into his dantian, fiery lotus runes igniting across his palms and forehead, the Flame Emperor's aura shaking the heavens, ethereal particles and heat distortion, 8k render",

  // Frame 6: Founding the Endless Fire Territory
  "make an image of 3D Chinese Donghua anime scene frame #6 of BTTH Flame Emperor novel: Establishing the majestic Endless Fire Territory, colossal floating obsidian palaces surrounded by rivers of celestial magma and protective burning runes, supreme banners fluttering with the golden emblem of the Flame Emperor, grand xianxia architecture, 8k",

  // Frame 7: Supreme Saint-Grade Alchemy Refinement
  "make an image of 3D Chinese Donghua anime scene frame #7 of BTTH Flame Emperor novel: Xiao Yan levitating cross-legged in the grand alchemy pavilion, controlling a mountain-sized Nine-Dragon cauldron with 22 Heavenly Flames, refining a Saint-grade celestial Spirit Pill causing colored pill lightning clouds to gather overhead, dazzling light effects, 8k",

  // Frame 8: Queen Medusa & Gu Xun'er by His Side
  "make an image of 3D Chinese Donghua anime scene frame #8 of BTTH Flame Emperor novel: Queen Medusa (Cai Lin) in gorgeous crimson silk robes with a nine-colored serpent phantom and Gu Xun'er in ethereal turquoise gowns wielding golden divine flames standing proudly beside Flame Emperor Xiao Yan atop the Endless Fire palace balcony overlooking their vast empire, 8k",

  // Frame 9: Legend Meets Legend — Xiao Yan and Lin Dong
  "make an image of 3D Chinese Donghua anime scene frame #9 of BTTH Flame Emperor novel: The epic first meeting between Flame Emperor Xiao Yan and Martial Ancestor Lin Dong, Xiao Yan holding the burning Black Ruler and Lin Dong holding the Great Desolate Monument, exchanging a respectful warrior fist salute against a cosmic twilight sky, legendary crossover scene, 8k",

  // Frame 10: Extraterritorial Evil Clan Invasion
  "make an image of 3D Chinese Donghua anime scene frame #10 of BTTH Flame Emperor novel: The sky tears open as billions of demonic fiends and colossal Heaven Demon Emperors descend upon the Great Thousand World shrouded in corrosive pitch-black demonic mist, ominous apocalyptic atmosphere, dark fantasy xianxia, 8k",

  // Frame 11: Summoning the Heavenly Flame Sovereign Avatar
  "make an image of 3D Chinese Donghua anime scene frame #11 of BTTH Flame Emperor novel: Xiao Yan summoning his titanic Heavenly Sovereign Flame Avatar (Di Yan Golden Body), a 100,000-foot colossal radiant giant composed of pure 22 Heavenly Flames piercing through storm clouds, incinerating demonic hordes in blinding radiance, godlike scale, 8k",

  // Frame 12: Condensing the 22-Color Emperor Buddha Flame Lotus
  "make an image of 3D Chinese Donghua anime scene frame #12 of BTTH Flame Emperor novel: Xiao Yan condensing the ultimate 22-colored Emperor Angry Buddha Flame Lotus between his fingertips, miniature sun of swirling iridescent flames spinning with cataclysmic energy ready to eradicate the Dark Demon Emperor, hyper-detailed particle explosion, 8k",

  // Frame 13: Annihilation of the Demon Emperor
  "make an image of 3D Chinese Donghua anime scene frame #13 of BTTH Flame Emperor novel: The 22-color Fire Lotus detonating across the cosmic battlefield, an ocean of holy rainbow fire purifying the demonic darkness, shockwaves shattering space, breathtaking cinematic climax, 8k render",

  // Frame 14: The Trinity of Supreme Sovereigns
  "make an image of 3D Chinese Donghua anime scene frame #14 of BTTH Flame Emperor novel: Flame Emperor Xiao Yan, Martial Ancestor Lin Dong, and the Great Ruler Mu Chen standing shoulder to shoulder atop the World Tree, radiating peerless supreme divine auras, defending the three realms, legendary Chinese donghua art, 8k",

  // Frame 15: Carving Name upon the Heavenly List
  "make an image of 3D Chinese Donghua anime scene frame #15 of BTTH Flame Emperor novel: Xiao Yan using holy Heavenly Flame as ink to carve the full name 'Xiao Yan' upon the colossal golden World Spirit Heavenly List (Cang Qiong Bang), ascending to the Ultimate Ruler realm beyond mortal gods, blinding celestial golden aura, 8k",

  // Frame 16: Eternal Reign of the Flame Emperor
  "make an image of 3D Chinese Donghua anime scene frame #16 of BTTH Flame Emperor novel: Xiao Yan standing at the pinnacle of the Great Thousand World as the eternal Flame Emperor, sovereign robes billowing in celestial wind, smiling warmly toward the horizon with his loved ones, peaceful and triumphant masterpiece, 8k wallpaper"
];

const FLAME_EMPEROR_PROCEDURAL = {
  actions: [
    "unleashing the Yellow Spring Palm infused with iridescent Heavenly Flames, shattering space into spiderweb fractures",
    "swinging the colossal Heavy Xuan Ruler ablaze with Pure Lotus Demon Fire, cutting through an incoming demonic asteroid",
    "channeling the Skyfire Three Mysterious Changes, radiant flame tattoos blazing across his face with overwhelming Dou Di pressure",
    "sitting in deep meditation surrounded by a rotating mandala of 22 sacred colored flames, harmonizing world spiritual energy",
    "commanding the defensive array of Endless Fire Territory as millions of flame disciples salute their emperor",
    "descending upon a mythical forbidden realm atop a soaring nine-colored fire phoenix, robes billowing majestically",
    "refining a legendary Saint-grade ancient artifact within a vortex of Golden Emperor Sky Burning Fire",
    "standing back-to-back with Martial Ancestor Lin Dong, unleashing a dual strike of primal thunder and primal fire"
  ],
  settings: [
    "in the core of the Endless Fire Territory atop an ancient volcanic throne surrounded by glowing magma waterfalls",
    "deep inside the turbulent dimensional cracks of the Great Thousand World under swirling star clusters",
    "atop the ancient celestial altar of the Fire Spirit Clan with primordial spirit flames burning on dragon pillars",
    "in the grand hall of the Great Thousand Palace surrounded by supreme sovereign masters and holy banners",
    "overlooking the boundless sea of clouds in the Northern Desolate Hills during a celestial twilight",
    "before the colossal golden World Spirit Heavenly List shimmering against the cosmic firmament"
  ],
  styles: [
    "cinematic 3D Chinese Donghua animation aesthetic, Sparkly Key and Tencent anime style, volumetric colored flame particles, intricate golden embroidery, Unreal Engine 5 render, 8k",
    "epic Xianxia fantasy donghua frame, hyper-detailed character model, dazzling elemental lighting, dramatic cinematic camera angle, 8k resolution, masterpiece",
    "high-budget Chinese animated movie still, dynamic lighting, glowing celestial runes, photorealistic cloth physics, award-winning 3D art"
  ]
};

// ─── BTTH Flame Emperor: Episodes 08 & 09 — Full Story Action Sequence (24 Frames) ───
// Source: "BTTH God: The Flame Emperor | Ep.08 & Ep.09 — Xiao Yan vs Peak 3-Star Dou Di"
// ─── BTTH Flame Emperor: Episodes 08 & 09 — Full Continuous Battle Video Sequence (24 Frames) ───
// Built for frame-by-frame continuous video playback in Cinema Player
// Strict visual anchor across all 24 frames: identical character models, arena setting, and motion progression

const XIAO_YAN_VS_3STAR_SEQUENCE = [
  // Frame 1 (0.0s): Standoff & Tension
  "make an image of continuous animation video keyframe #1 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Xiao Yan (young handsome cultivation hero, long black ponytail tied with red silk, black and crimson Dou Di battle robes with gold dragon trim, glowing golden flame mark on forehead) standing in combat stance on the left with Heavy Xuan Ruler slung on back, facing the Peak 3-Star Dou Di (massive 7-foot tall muscular warlord in dark purple spiked bone armor, crackling violet Dou Qi aura) standing 30 feet away on the right upon a floating ruined stone combat altar above swirling dark storm clouds, purple lightning crackles between them, intense standoff, camera low angle, 8k resolution",

  // Frame 2 (0.2s): Guardian Lunges Forward
  "make an image of continuous animation video keyframe #2 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Xiao Yan and Peak 3-Star Dou Di on the floating stone combat altar under storm clouds. The guardian suddenly lunges forward with explosive speed, right fist drawn back, trailing jagged purple lightning arcs and leaving shattered stone cracks in his wake, moving leftward across screen. Xiao Yan reaches his right hand back toward his Heavy Xuan Ruler hilt, seamless motion continuity from frame #1, directional motion blur, 8k",

  // Frame 3 (0.4s): Mid-Rush & Fist Charge
  "make an image of continuous animation video keyframe #3 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Peak 3-Star Dou Di charging at full sprint, his massive dark-purple fist engulfed in a swirling vortex of destructive Dou Di energy screaming toward the camera. Xiao Yan firmly grips the black hilt of the Heavy Xuan Ruler, brilliant emerald Green Lotus flame igniting across his knuckles and ruler collar, seamless motion continuity from frame #2, intense battle focus, 8k",

  // Frame 4 (0.6s): The Draw & Flaming Upward Arc
  "make an image of continuous animation video keyframe #4 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Xiao Yan rapidly draws the colossal black Heavy Xuan Ruler from his back in a violent upward diagonal sweep, a vibrant crescent arc of Green Lotus Core Flame blazing along the heavy blade, robes whipping dynamically in the wind as the guardian's purple fist enters frame just inches away, seamless motion continuity from frame #3, 8k",

  // Frame 5 (0.8s): The Collision (Impact Frame)
  "make an image of continuous animation video keyframe #5 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Impact moment! The Peak 3-Star Dou Di's massive purple lightning fist collides directly with the flat iron face of Xiao Yan's blazing Heavy Xuan Ruler! A blinding explosion of violet lightning and emerald fire shockwave rings detonates at the contact point, sparks flying violently outward, camera low angle, dramatic impact lighting, seamless motion continuity from frame #4, 8k",

  // Frame 6 (1.0s): Shockwave Ripples Outward
  "make an image of continuous animation video keyframe #6 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: 0.2s after impact, the immense kinetic shockwave ripples across the stone arena, fracturing the heavy stone floor into floating shattered slabs. Xiao Yan's black battle robes billow furiously backward as he braces against the crushing Dou Di pressure, green and purple flames violently colliding between the combatants, seamless motion continuity from frame #5, 8k",

  // Frame 7 (1.2s): Xiao Yan Slides Backward
  "make an image of continuous animation video keyframe #7 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: The explosive force pushes Xiao Yan sliding backward 10 feet across the arena floor, boots digging into the stone leaving two smoking friction trenches, his Heavy Xuan Ruler planted firmly on the ground to brake his momentum, eyes locked coldly onto the enemy through dispersing embers, seamless motion continuity from frame #6, 8k",

  // Frame 8 (1.4s): Guardian Follow-up Rush
  "make an image of continuous animation video keyframe #8 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: The Peak 3-Star Dou Di bursts through the smoke cloud without stopping, leaping into the air with left arm cocked for a devastating downward hammer fist strike aimed at Xiao Yan, dark purple lightning crackling violently along his spiked forearm armor, camera tracking the guardian's descent, seamless motion continuity from frame #7, 8k",

  // Frame 9 (1.6s): Lightning Movement Evasion
  "make an image of continuous animation video keyframe #9 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: The guardian's hammer fist pulverizes the stone ground in an explosion of rock and purple lightning, but Xiao Yan activates Three Thousand Lightning Movement, his body blurring into three distinct blue-white lightning afterimages that vanish to the side just in the nick of time, seamless motion continuity from frame #8, 8k",

  // Frame 10 (1.8s): Flank Counter Sweep
  "make an image of continuous animation video keyframe #10 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Xiao Yan materializes instantly at the guardian's unprotected right flank, swinging the Heavy Xuan Ruler with both hands in a wide horizontal waist-level arc, a searing wave of fused golden and green Heavenly Flame cutting through the air toward the guardian's waist, motion blur on blade, seamless motion continuity from frame #9, 8k",

  // Frame 11 (2.0s): Armor Shatters Under Impact
  "make an image of continuous animation video keyframe #11 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: The blazing Heavy Xuan Ruler slams violently into the guardian's hastily-raised purple forearm bone-guard, cracking the dark bone plate with a resounding smash, glowing purple armor shards and fiery orange sparks bursting outward into the air, guardian gritting his teeth in pain, seamless motion continuity from frame #10, 8k",

  // Frame 12 (2.2s): Guardian Condenses Thunder Spear
  "make an image of continuous animation video keyframe #12 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: The guardian staggers back two paces, roars in fury, and raises both hands as dark purple Emperor Origin Qi condenses into a crackling 8-foot thunder spear between his palms, dark lightning tearing at the surrounding air, eyes glowing predatory purple, seamless motion continuity from frame #11, 8k",

  // Frame 13 (2.4s): Hurl of the Thunder Spear
  "make an image of continuous animation video keyframe #13 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: The guardian hurls the crackling purple thunder spear at terrifying velocity toward Xiao Yan, the spear point tearing a black dimensional rift across the space between them, camera tracking behind the hurtling spear as Xiao Yan raises his left palm in defense, seamless motion continuity from frame #12, 8k",

  // Frame 14 (2.6s): Heavenly Flame Shield Erupts
  "make an image of continuous animation video keyframe #14 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Xiao Yan thrusts his open left palm forward, instantly summoning a spinning circular mandala shield composed of fused Green Lotus Flame and Golden Emperor Sky Burning Fire, intricate ancient flame runes glowing intensely across the barrier surface, seamless motion continuity from frame #13, 8k",

  // Frame 15 (2.8s): Spear Detonation on Flame Shield
  "make an image of continuous animation video keyframe #15 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: The purple thunder spear impacts Xiao Yan's flame mandala shield in a colossal blinding detonation of violet lightning and multi-colored fire! Shockwaves disintegrate the outer edge of the shield, forcing Xiao Yan to drop to one knee to brace against the blast, smoke swirling rapidly, seamless motion continuity from frame #14, 8k",

  // Frame 16 (3.0s): Mid-Battle Cultivation Breakthrough
  "make an image of continuous animation video keyframe #16 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Through the dissipating smoke, Xiao Yan absorbs the ambient spiritual energy and Emperor Origin Qi in an instant! The golden flame insignia on his forehead blazes like a radiant star, and an explosive golden-red Dou Di breakthrough aura detonates outward in a towering expanding pillar of celestial flame, eyes ablaze with supreme power, seamless motion continuity from frame #15, 8k",

  // Frame 17 (3.2s): Flame Emperor Golden Avatar Rises
  "make an image of continuous animation video keyframe #17 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Xiao Yan stands tall as a 100-foot colossal radiant Flame Emperor Golden Avatar manifests behind him, a celestial titan composed of pure fused multi-colored Heavenly Flames with giant rainbow phoenix fire wings spreading across the dark storm clouds, dwarfing the shocked guardian below, legendary scale, seamless motion continuity from frame #16, 8k",

  // Frame 18 (3.4s): Avatar Overhead Hammer Strike
  "make an image of continuous animation video keyframe #18 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Xiao Yan's colossal Flame Emperor Avatar brings its titanic rainbow flame fist crashing down from the clouds in an earth-shattering hammer strike, smashing directly into the guardian's frantic purple Dou Di energy barrier and pulverizing it into sparkling purple dust, arena shaking violently, seamless motion continuity from frame #17, 8k",

  // Frame 19 (3.6s): Guardian Staggered & Battered
  "make an image of continuous animation video keyframe #19 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: The guardian is driven down onto one knee coughing blood, dark purple bone armor heavily cracked and smoking, his Dou Di aura destabilizing. In the foreground, Xiao Yan calmly steps forward, raising both hands to begin weaving the ultimate technique, seamless motion continuity from frame #18, 8k",

  // Frame 20 (3.8s): Weaving the Multi-Color Angry Buddha Lotus
  "make an image of continuous animation video keyframe #20 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Medium close-up on Xiao Yan: his hands rapidly weave green, golden, and purple-black Heavenly Flames together in front of his chest, each flame ring harmonizing into a spinning crystal lotus flower, a miniature rainbow sun of cataclysmic energy forming between his palms, sweat on his brow, supreme calm, seamless motion continuity from frame #19, 8k",

  // Frame 21 (4.0s): The Lotus Fully Awakens (Extreme Close-up)
  "make an image of continuous animation video keyframe #21 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Macro close-up on Xiao Yan's fingertips holding the fully condensed Nine-Color Angry Buddha Fire Lotus! The spinning multi-colored crystal lotus petals glow with blinding celestial radiance, radiating intense heat distortion waves and prismatic god rays that illuminate Xiao Yan's confident gaze, seamless motion continuity from frame #20, 8k",

  // Frame 22 (4.2s): Launching the Nine-Color Fire Lotus
  "make an image of continuous animation video keyframe #22 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Xiao Yan thrusts both open palms forward, launching the Nine-Color Fire Lotus streaking across the arena like a blazing rainbow comet, leaving a luminous wake of vaporized space as it hurtles directly toward the terrified, desperately-blocking Peak 3-Star Dou Di, camera tracking shot, seamless motion continuity from frame #21, 8k",

  // Frame 23 (4.4s): The Cataclysmic Purifying Detonation
  "make an image of continuous animation video keyframe #23 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: The Nine-Color Fire Lotus detonates! A colossal spherical dome of holy rainbow fire and purifying light expands across the entire battlefield, completely consuming the guardian's purple aura, tearing storm clouds into golden fragments and illuminating the Great Thousand World horizon in dazzling cinematic brilliance, seamless motion continuity from frame #22, 8k",

  // Frame 24 (4.6s): Victory — The Flame Emperor Standing Tall
  "make an image of continuous animation video keyframe #24 of 24, exact same continuous action shot: 3D Chinese Donghua anime style, 16:9 widescreen cinematic cut, identical characters and setting: Wide cinematic aftermath shot: golden sunlight beams flood through the clearing sky onto the scorched stone arena. Xiao Yan stands tall in the foreground in his battle robes, the Heavy Xuan Ruler planted proudly beside him, surrounded by gently drifting rainbow embers, while the defeated guardian lies unconscious in the distant smoking crater, triumphant victory, 8k resolution"
];

function generateXiaoYanBattleFrame(frameNum = 1) {
  const idx = (Math.max(1, frameNum) - 1) % XIAO_YAN_VS_3STAR_SEQUENCE.length;
  return XIAO_YAN_VS_3STAR_SEQUENCE[idx];
}

// ─── Continuous Fluid Video Motion Sequence (Consistent Animation Keyframes) ───
const FLAME_EMPEROR_VIDEO_SEQUENCE = [
  // Frame 1: Stance & Power Gathering
  "make an image of 3D Chinese Donghua anime animation video sequence frame #1: Xiao Yan the Flame Emperor, identical face, identical flowing black imperial robes with gold embroidery, holding the Heavy Xuan Ruler planted in ancient volcanic rock, green lotus flames beginning to glow at his fingertips, camera slowly zooming in, 24fps motion keyframe, Tencent anime style, 8k",

  // Frame 2: Pulling the Blade Upward
  "make an image of 3D Chinese Donghua anime animation video sequence frame #2: Continuous video shot, exact same scene, Xiao Yan lifting the Heavy Xuan Ruler with both hands, green embers and heat distortion trailing from the blade tip, camera tracking upwards, identical character model, 8k",

  // Frame 3: Flame Vortex Forms
  "make an image of 3D Chinese Donghua anime animation video sequence frame #3: Continuous video shot, exact same scene, Xiao Yan sweeping the ruler in a tight arc, a swirling circular vortex of emerald fire expanding around him, motion blur on blade, identical character face and robes, 8k",

  // Frame 4: Heavenly Flames Erupt
  "make an image of 3D Chinese Donghua anime animation video sequence frame #4: Continuous video shot, exact same scene, 22 distinct colored Heavenly Flames burst into life along the length of the ruler, dazzling prismatic aura illuminating Xiao Yan's sharp focused eyes, camera low angle, 8k",

  // Frame 5: Overhead Strike Stance
  "make an image of 3D Chinese Donghua anime animation video sequence frame #5: Continuous video shot, exact same scene, Xiao Yan leaping into mid-air, raising the flaming Heavy Ruler high above his head at apex height, dynamic rim lighting, identical character details, 8k",

  // Frame 6: Downward Slash & Shockwave
  "make an image of 3D Chinese Donghua anime animation video sequence frame #6: Continuous video shot, exact same scene, Xiao Yan slashing downward with intense speed, a massive crescent of 22-colored fire cutting through the air, directional motion blur, cinematic shutter, 8k",

  // Frame 7: Impact & Ground Eruption
  "make an image of 3D Chinese Donghua anime animation video sequence frame #7: Continuous video shot, exact same scene, the flame crescent crashes into the ground, exploding into towering pillars of rainbow fire, shockwave rings expanding across the screen, 8k",

  // Frame 8: Landing in Foreground
  "make an image of 3D Chinese Donghua anime animation video sequence frame #8: Continuous video shot, exact same scene, Xiao Yan landing smoothly in the foreground on one knee amidst billowing smoke and floating sparks, his black robes fluttering dynamically, 8k",

  // Frame 9: Condensing the Mini Lotus
  "make an image of 3D Chinese Donghua anime animation video sequence frame #9: Continuous video shot, exact same scene, close-up tracking shot, Xiao Yan raising his left palm as a miniature 22-color Fire Lotus starts spinning between his fingers, soft depth of field, 8k",

  // Frame 10: Lotus Blossoming with Power
  "make an image of 3D Chinese Donghua anime animation video sequence frame #10: Continuous video shot, exact same scene, close-up shot, the Fire Lotus opens its petals, a miniature rainbow sun radiating blinding holy light, casting dynamic multi-colored shadows across Xiao Yan's confident smirk, 8k",

  // Frame 11: Flicking Lotus Forward
  "make an image of 3D Chinese Donghua anime animation video sequence frame #11: Continuous video shot, exact same scene, Xiao Yan flicking his wrist forward, the spinning Fire Lotus streaking toward the horizon leaving a brilliant streak of rainbow light particles, camera whipping forward, 8k",

  // Frame 12: Grand Detonation & Purifying Radiance
  "make an image of 3D Chinese Donghua anime animation video sequence frame #12: Continuous video shot, exact same scene, wide cinematic vista, the Fire Lotus detonating in the distance, a colossal shockwave dome of purifying rainbow fire vaporizing the dark storm clouds, Xiao Yan standing victorious in foreground, 8k"
];

const CARTOON_STORY = {
  characters: [
    "a brave little cartoon red panda wearing a tiny leather aviator jacket and brass goggles",
    "a cheerful cartoon rabbit knight with a glowing golden carrot sword and shiny silver armor",
    "a clumsy, adorable baby dragon who sneezes colorful rainbow sparks and smoke puffs",
    "a spirited young cartoon girl explorer with pigtails and a magical floating starlight fairy",
    "a clever little cartoon mouse inventor steering a tiny steam-powered acorn copter",
    "a gentle cartoon bear cub wearing a knitted yellow scarf and carrying a glowing acorn lantern",
    "a curious young cartoon fox with a fluffy tail and an oversized explorer's backpack",
    "a friendly cartoon penguin chef in a tall white hat carrying a basket of sparkling berry tarts"
  ],

  settings: [
    "in a whimsical fairytale forest where ancient trees have gentle smiling faces and glowing fruit",
    "inside a cozy treehouse workshop filled with glowing potion bottles and floating blueprints",
    "on a floating moss-covered sky island drifting among pastel pink and golden sunset clouds",
    "in a charming cobblestone village with crooked colorful mushroom cottages and lantern lights",
    "inside an ancient crystalline cavern illuminated by pulsating rainbow geodes",
    "along the shores of a sparkling turquoise lagoon with singing seashell houses"
  ],

  acts: [
    // Act 1: The Beginning / The Call to Adventure
    [
      "discovering an ancient glowing treasure map hidden inside an old hollow oak tree, eyes wide with wonder",
      "finding a mysterious glowing crystal key buried under glittering golden autumn leaves",
      "waving goodbye to animal friends from a treehouse porch as an epic journey begins",
      "peering through a brass telescope at a magical floating castle shimmering atop distant clouds"
    ],
    // Act 2: The Journey / Overcoming Challenges
    [
      "carefully tip-toeing across a rickety rope bridge over a sparkling river of bubbly blue jelly",
      "gliding gracefully through an enchanted valley riding atop a giant floating dandelion fluff",
      "sneaking quietly on tiptoes past a giant cuddly sleeping mountain troll covered in wild daisies",
      "steering a leaf-boat down a gentle twisting stream filled with leaping golden koi fish"
    ],
    // Act 3: Companionship / Teamwork
    [
      "sharing roasted sweet star-marshmallows around a cozy campfire with a newly met forest creature",
      "teaming up with a playful baby griffin to solve a glowing stone rune puzzle on an ancient archway",
      "soaring high above the clouds aboard a whimsical wooden airship steered by glowing jellyfish",
      "sliding down a giant swirling rainbow waterfall, laughing with outstretched arms"
    ],
    // Act 4: The Climax / Grand Discovery
    [
      "reaching the peak of Starfall Mountain as hundreds of dazzling shooting stars illuminate the sky",
      "unlocking a giant ornate treasure chest that bursts open with shimmering golden star-candies",
      "placing the missing Crystal Star atop an ancient monument, bathing the entire fairytale land in magical emerald light",
      "dancing and celebrating joyfully in a village square filled with fluttering confetti and cheering cartoon creatures"
    ]
  ],

  styles: [
    "Disney Pixar 3D animated movie style, expressive cute character design, vibrant saturated colors, rich cinematic lighting, subsurface scattering, 8k render, masterpiece",
    "Pixar animated feature film still, heartwarming storybook aesthetic, volumetric golden sunlight, playful composition, delightfully detailed, 8k resolution",
    "charming 3D animation frame, adorable facial expressions, lush fairytale environment, warm magical glow, award-winning cinematic 3D style"
  ]
};

const PROMPT_DATABASE = {
  cartoon_story: CARTOON_STORY,

  pixar: {
    subjects: [
      "a cute round cartoon robot trying to protect a tiny yellow flower from a gust of wind",
      "a fluffy cartoon kitten astronaut floating inside the cockpit of a miniature spaceship",
      "an adorable cartoon monster barista serving a smoking cup of hot chocolate with marshmallows",
      "a clumsy young cartoon wizard apprentice whose spell turned all the teacups into fluttering butterflies",
      "a tiny cartoon chameleon that accidentally painted itself with neon polka dots while exploring an artist's easel",
      "a loyal cartoon dog wearing a detective trench coat and examining giant glowing pawprints with a magnifying glass"
    ],
    settings: [
      "in a sunlit modern kitchen with flour puffing everywhere and warm golden window light",
      "inside a cozy miniature attic bedroom filled with warm string lights and vintage toys",
      "on a bustling colorful animated city street during a gentle rain with colorful umbrellas",
      "in an enchanted garden with oversized dew-covered blades of grass and giant ladybugs"
    ],
    styles: [
      "Pixar animation style, charming personality, soft fur rendering, subsurface scattering, warm cinematic lighting, 8k",
      "Disney 3D animation quality, expressive eyes, vibrant color palette, beautiful depth of field, adorable render"
    ]
  },

  scifi: {
    subjects: [
      "a high-tech cybernetic assassin with glowing optical visor",
      "a massive interstellar exploratory dreadnought in hyperspace",
      "a rogue android mechanic repairing an orbital satellite",
      "a towering armored battle-mech equipped with plasma railguns",
      "a futuristic hovercar speeding through mid-air sky-lanes",
      "a cyberpunk street hacker surrounded by holographic code cubes",
      "an extraterrestrial biomechanical guardian standing by an alien portal",
      "a cyber-enhanced samurai drawing an energized laser katana"
    ],
    settings: [
      "in a rain-slicked dystopian cyberpunk city illuminated by towering holographic billboards",
      "orbiting a colossal purple ringed gas giant in the Andromeda galaxy",
      "inside a dark subterranean quantum computer vault with glowing cooling fluid",
      "on the rust-red jagged surface of Mars under a starry cosmic sky",
      "inside an atmospheric neon-lit noodle bar in futuristic Neo-Tokyo"
    ],
    styles: [
      "cinematic lighting, volumetric cyan and magenta haze, raytraced reflections, Unreal Engine 5 render, 8k resolution",
      "moody cyberpunk atmosphere, wet asphalt reflections, lens flare, photorealistic textures, Octane render",
      "hard sci-fi aesthetic, intricate mechanical greebles, industrial realism, dramatic high-contrast lighting"
    ]
  },

  fantasy: {
    subjects: [
      "a majestic elder dragon with iridescent crystalline scales",
      "a celestial archmage conjuring a spinning vortex of starlight",
      "a silver-armored paladin wielding a glowing runic broadsword",
      "a mythical phoenix with azure fire wings rising from ashes",
      "an ethereal forest dryad commanding glowing bioluminescent vines",
      "a grand griffin perched atop a wind-swept snow-covered mountain crag"
    ],
    settings: [
      "in an enchanted primeval forest surrounded by giant glowing mushrooms and fireflies",
      "inside the ruins of an ancient gothic cathedral lit by mystical floating orbs",
      "on a floating moss-covered island drifting among northern aurora borealis",
      "in a deep crystalline cavern illuminated by pulsating amethyst geodes",
      "at the base of a roaring cascading waterfall under a celestial double moon"
    ],
    styles: [
      "epic digital fantasy painting, volumetric god rays, magical sparkling dust particles, masterpiece, 8k",
      "dark fantasy aesthetic, atmospheric fog, ethereal glow, detailed painterly textures, ArtStation trending",
      "mythological high-fantasy illustration, vibrant colors, dramatic rim light, intricate ornate armor detailing"
    ]
  },

  portraits: {
    subjects: [
      "a cinematic close-up portrait of a fierce female warrior with intense gaze and braided hair",
      "a hyperrealistic portrait of a weathered old sea captain with deep wrinkles and silver beard",
      "an ethereal portrait of an elven princess adorned with delicate silver filigree jewelry",
      "a futuristic cyborg woman with porcelain skin and subtle golden circuit inlays",
      "a stylish high-fashion editorial portrait of a model with dramatic avant-garde lighting"
    ],
    settings: [
      "dramatic dark studio backdrop with soft warm key light and sharp cyan rim light",
      "soft natural golden hour sunlight filtering through autumn leaves with dreamy bokeh",
      "illuminated by neon streetlights in a rainy metropolitan city at night",
      "clean minimalist studio lighting with subtle film grain and Rembrandt shadows"
    ],
    styles: [
      "shot on Hasselblad 100MP, 85mm f/1.2 lens, shallow depth of field, photorealistic skin pores, 8k portrait",
      "National Geographic photography style, tack-sharp eye reflections, stunning emotional depth, photorealistic"
    ]
  },

  nature: {
    subjects: [
      "a majestic snow leopard stalking gracefully across rugged Himalayan icy cliffs",
      "a glittering iridescent hummingbird suspended in mid-air drinking nectar from a vibrant orchid",
      "a massive humpback whale leaping through sun-drenched turquoise ocean spray",
      "a noble white stag with colossal antlers standing majestically in morning meadow fog",
      "a fierce golden eagle diving at high speed through a dramatic mountain gorge"
    ],
    settings: [
      "in the dense heart of an emerald Amazonian rainforest with sunbeams piercing mist",
      "along the dramatic turquoise fjords of Norway under an epic sunset sky",
      "beside a crystal-clear alpine glacial lake reflecting snow-capped mountain peaks",
      "across the golden expanse of the Serengeti savanna beneath brewing thunderheads"
    ],
    styles: [
      "award-winning wildlife photography, BBC Planet Earth cinematography, tack-sharp focus, natural lighting, 8k",
      "epic landscape photography, golden hour radiance, ultra-wide angle, crisp natural textures, UHD"
    ]
  },

  vehicles: {
    subjects: [
      "a concept aerodynamic hypercar with forged carbon fiber and glowing LED lightbars",
      "a futuristic stealth fighter jet screaming through cloud layers at supersonic speed",
      "a classic 1969 American muscle car drifting through a rain-drenched neon intersection",
      "a custom cafe racer motorcycle parked on a cobblestone alley under vintage streetlights"
    ],
    settings: [
      "speeding along a perilous coastal cliffside highway during golden sunset",
      "parked in a minimalist concrete architectural garage with dramatic overhead light strips",
      "cutting across endless shimmering white salt flats under dramatic storm clouds"
    ],
    styles: [
      "automotive commercial photography, dynamic motion blur, glossy paint reflections, raytraced metallic sheen, 8k",
      "cinematic high-octane aesthetic, Speedhunters style photography, dramatic low-angle shot, photorealistic"
    ]
  },

  anime: {
    subjects: [
      "a determined demon slayer swordsman surrounded by crackling lightning and cherry blossom petals",
      "a heroic mecha pilot standing bravely before a colossal glowing combat robot",
      "a magical anime heroine floating in mid-air with swirling starlight ribbons",
      "a skilled cyberpunk ninja girl leaping across neon-lit skyscrapers under a crescent moon"
    ],
    settings: [
      "against an epic sunset sky filled with floating clouds and distant floating islands",
      "in a bustling fantasy market street adorned with glowing lanterns and colorful stalls",
      "at a tranquil hilltop shrine overlooking a sprawling futuristic coastal city"
    ],
    styles: [
      "Makoto Shinkai anime style, vibrant breathtaking colors, dazzling light particles, 4k digital wallpaper",
      "Ufotable animation aesthetic, dynamic action angle, vivid elemental effects, masterclass anime art"
    ]
  },

  cinematic: {
    subjects: [
      "a lone astronaut standing in awe before an ancient glowing alien monolith",
      "a solitary detective in a fedora and trench coat walking down a rain-soaked noir alley",
      "a massive historic fortress besieged by an incoming apocalyptic dust storm"
    ],
    settings: [
      "panoramic cinematic vista with dramatic anamorphic lens flares and dense atmospheric haze",
      "under an imposing dramatic overcast sky with god rays breaking through dark clouds"
    ],
    styles: [
      "shot on ARRI Alexa 65, Panavision anamorphic lens, 2.39:1 aspect ratio, Christopher Nolan film still, 8k",
      "Denis Villeneuve cinematography style, grand scale, moody atmospheric color grading, cinematic masterpiece"
    ]
  }
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFlameEmperorVideoFrame(frameNum = 1) {
  const normalizedIndex = (Math.max(1, frameNum) - 1) % FLAME_EMPEROR_VIDEO_SEQUENCE.length;
  return FLAME_EMPEROR_VIDEO_SEQUENCE[normalizedIndex];
}

function generateFlameEmperorFrame(frameNum = 1) {
  const normalizedIndex = Math.max(1, frameNum) - 1;
  // If within the 16 canon story frames, return the accurate novel scene
  if (normalizedIndex < FLAME_EMPEROR_CANON_FRAMES.length) {
    return FLAME_EMPEROR_CANON_FRAMES[normalizedIndex];
  }

  // For frames beyond 16, dynamically construct novel continuation scenes
  const action  = pickRandom(FLAME_EMPEROR_PROCEDURAL.actions);
  const setting = pickRandom(FLAME_EMPEROR_PROCEDURAL.settings);
  const style   = pickRandom(FLAME_EMPEROR_PROCEDURAL.styles);

  return `make an image of 3D Chinese Donghua anime scene frame #${frameNum} of BTTH Flame Emperor novel: Xiao Yan the Flame Emperor wearing black imperial robes embroidered with gold, ${action}, ${setting}, ${style}`;
}

function generateCartoonStoryFrame(frameNum = 1) {
  const char = pickRandom(CARTOON_STORY.characters);
  const actIndex = (Math.max(1, frameNum) - 1) % CARTOON_STORY.acts.length;
  const action = pickRandom(CARTOON_STORY.acts[actIndex]);
  const setting = pickRandom(CARTOON_STORY.settings);
  const style = pickRandom(CARTOON_STORY.styles);

  return `make an image of cartoon animation story frame #${frameNum}: ${char} ${action}, ${setting}, ${style}`;
}

function generateRandomPrompt(theme = 'flame_video', frameNum = 1) {
  if (theme === 'flame_video') {
    return generateFlameEmperorVideoFrame(frameNum);
  }

  if (theme === 'flame_emperor') {
    return generateFlameEmperorFrame(frameNum);
  }

  if (theme === 'xiao_yan_battle') {
    return generateXiaoYanBattleFrame(frameNum);
  }

  if (theme === 'cartoon_story') {
    return generateCartoonStoryFrame(frameNum);
  }

  const categories = Object.keys(PROMPT_DATABASE).filter(k => k !== 'cartoon_story');
  let selectedCategory = theme;

  if (!selectedCategory || selectedCategory === 'mixed' || !PROMPT_DATABASE[selectedCategory]) {
    // 35% chance to pick flame video sequence or cartoon story in mixed mode for variety
    const r = Math.random();
    if (r < 0.25) {
      return generateFlameEmperorVideoFrame(frameNum);
    } else if (r < 0.45) {
      return generateCartoonStoryFrame(frameNum);
    }
    selectedCategory = pickRandom(categories);
  }

  const catData = PROMPT_DATABASE[selectedCategory];
  const subject = pickRandom(catData.subjects);
  const setting = pickRandom(catData.settings);
  const style   = pickRandom(catData.styles);

  return `make an image of ${subject}, ${setting}, ${style}`;
}

// Make accessible in both browser window (popup.js) and worker (background.js)
if (typeof self !== 'undefined') {
  self.generateRandomPrompt = generateRandomPrompt;
  self.generateCartoonStoryFrame = generateCartoonStoryFrame;
  self.generateFlameEmperorFrame = generateFlameEmperorFrame;
  self.generateFlameEmperorVideoFrame = generateFlameEmperorVideoFrame;
  self.generateXiaoYanBattleFrame = generateXiaoYanBattleFrame;
  self.FLAME_EMPEROR_CANON_FRAMES = FLAME_EMPEROR_CANON_FRAMES;
  self.FLAME_EMPEROR_VIDEO_SEQUENCE = FLAME_EMPEROR_VIDEO_SEQUENCE;
  self.XIAO_YAN_VS_3STAR_SEQUENCE = XIAO_YAN_VS_3STAR_SEQUENCE;
  self.PROMPT_DATABASE = PROMPT_DATABASE;
}
if (typeof window !== 'undefined') {
  window.generateRandomPrompt = generateRandomPrompt;
  window.generateCartoonStoryFrame = generateCartoonStoryFrame;
  window.generateFlameEmperorFrame = generateFlameEmperorFrame;
  window.generateFlameEmperorVideoFrame = generateFlameEmperorVideoFrame;
  window.generateXiaoYanBattleFrame = generateXiaoYanBattleFrame;
  window.FLAME_EMPEROR_CANON_FRAMES = FLAME_EMPEROR_CANON_FRAMES;
  window.FLAME_EMPEROR_VIDEO_SEQUENCE = FLAME_EMPEROR_VIDEO_SEQUENCE;
  window.XIAO_YAN_VS_3STAR_SEQUENCE = XIAO_YAN_VS_3STAR_SEQUENCE;
  window.PROMPT_DATABASE = PROMPT_DATABASE;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateRandomPrompt,
    generateCartoonStoryFrame,
    generateFlameEmperorFrame,
    generateFlameEmperorVideoFrame,
    generateXiaoYanBattleFrame,
    FLAME_EMPEROR_CANON_FRAMES,
    FLAME_EMPEROR_VIDEO_SEQUENCE,
    XIAO_YAN_VS_3STAR_SEQUENCE,
    PROMPT_DATABASE
  };
}

