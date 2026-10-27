/* ------------------------------------------------------------------
   FLC 2027 — all conference content
   Source: Filtrona Leadership Conference Welcome Booklet (Shanghai). Dates moved to 19–21 Jan 2027
   Edit text here; the layout reads everything from this file.
   Times are event time (Shanghai, UTC+08:00), 24-hour "HH:MM".
------------------------------------------------------------------- */
window.FLC_DATA = {

  event: {
    name: "Filtrona Leadership Conference",
    short: "FLC 2027",
    theme: "Driving Change, Delivering Results",
    dates: "19 – 21 January 2027",
    city: "Shanghai, China",
    tz: "Asia/Shanghai",
    tzLabel: "Shanghai time (UTC+8)",
    utcOffset: "+08:00",
    start: "2027-01-18T17:30:00+08:00",
    end: "2027-01-21T12:50:00+08:00"
  },

  /* ---------------- Chapter 01 · Welcome ---------------- */
  welcome: {
    from: "Robert Pye",
    role: "Chief Executive Officer",
    photo: "assets/img/robert-pye.webp",
    salutation: "Dear colleagues,",
    paragraphs: [
      "Welcome to the 2027 Filtrona Leadership Conference in Shanghai! I’m thrilled to have our global leadership team together at this pivotal moment.",
      "Our theme, Driving Change, Delivering Results, reflects the urgency and opportunity ahead. Change isn’t optional — it’s essential. To stay ahead, we must adapt quickly, innovate with purpose, and leverage our collective strengths.",
      "This conference is our platform to align on priorities, sharpen strategies, and commit to actions that deliver impact. Each of you plays a vital role in shaping Filtrona’s future. Stay engaged, participate actively, and lead with clarity and confidence.",
      "Filtrona’s history is built on resilience and reinvention. By embracing change and holding ourselves accountable, we can turn challenges into opportunities and create lasting value for our customers and stakeholders.",
      "Together, we will drive the change we want to see and deliver the results that secure our future. I look forward to seeing you at the conference."
    ],
    signoff: "Regards,",
    pullquote: "Change isn’t optional — it’s essential."
  },

  /* ---------------- Chapter 02 · About China ---------------- */
  china: {
    facts: [
      { label: "Capital", value: "Beijing" },
      { label: "Currency", value: "RMB (¥)" },
      { label: "Total area", value: "9,600,000 km²" },
      { label: "Language", value: "Chinese" }
    ],
    map: "assets/img/china-map.jpg",
    overview: "The People's Republic of China is located in the eastern part of Asia and on the west coast of the Pacific Ocean. Its capital is Beijing. It covers a land area of approximately 9.6 million square kilometers, with a coastline of over 18,000 kilometers in the east and south, and a total maritime area of about 4.73 million square kilometers. China is one of the countries with the longest histories in the world, boasting a splendid culture and leading the world in the number of world heritage sites. China is the second most populous country in the world, ranks third in terms of land area, and is the second largest economy in the world, consistently being the largest contributor to global economic growth. China is a permanent member of the United Nations Security Council and an important member of many international organizations. It is considered one of the potential superpowers.",
    funFact: "China is a unified multi-ethnic country composed of 56 ethnic groups, with a distribution pattern of large-scale mixed residence and small-scale concentrated residence among ethnic groups.",
    funFactImage: "assets/img/china-people.jpg"
  },

  weather: {
    range: "3 °C – 11 °C",
    low: 3, high: 11,
    headline: "The average temperature in Shanghai in January is 3 °C to 11 °C.",
    note: "The temperature difference between day and night is significant!",
    wear: [
      "Thick long sleeves",
      "Thick T-shirts",
      "Base coats with slightly thick jackets",
      "Spring and autumn jackets",
      "Thick suits",
      "Thick windbreakers"
    ]
  },

  /* ---------------- Chapter 03 · About Shanghai ---------------- */
  shanghai: {
    hero: "assets/img/shanghai-aerial.jpg",
    map: "assets/img/shanghai-map.jpg",
    overview: "Shanghai is located in eastern China, at the mouth of the Yangtze River, with a total area of 6340.5 square kilometers and a permanent population of 24.8026 million. Shanghai is an international economic, financial, trade, shipping, technological innovation, and cultural center, a mega city, and a world-class city.",
    stats: [
      { value: "6,340.5", unit: "km²", label: "Total area" },
      { value: "24.8", unit: "million", label: "Permanent population" }
    ],
    transport: {
      text: "The operating mileage of Shanghai's transportation network reaches 898 kilometers, with a total of 21 rail transit lines including subway, light rail, maglev, and urban railways, and 518 stations, including 89 transfer stations. The network size, number of vehicles, and fully automated operating line mileage all rank among the top in the world, with an average daily passenger flow of nearly 12 million.",
      stats: [
        { value: "898", unit: "km", label: "Network" },
        { value: "21", unit: "", label: "Rail lines" },
        { value: "518", unit: "", label: "Stations" },
        { value: "12M", unit: "", label: "Daily riders" }
      ],
      map: "assets/img/shanghai-metro.jpg"
    },
    funFact: {
      title: "Shengjian Bao",
      text: "Shanghai Shengjian Bao is a native Shanghai snack, primarily filled with fresh pork and meat jelly (pigtrotter aspic). After the 1930s, dedicated Shengjian Mantou (pan-fried bun) shops emerged in Shanghai’s culinary scene, and fillings diversified to include variations like chicken and shrimp. Shengjian Bao has been recognized by Forbes as a global culinary delight.",
      image: "assets/img/shengjian-bao.jpg"
    }
  },

  /* ---------------- Chapter 04 · The hotel ---------------- */
  hotel: {
    name: "JW Marriott Marquis Hotel Shanghai Pudong",
    short: "JW Marriott Marquis Pudong",
    address: "No. 988, Puming Road, Pudong New Area, Shanghai, China",
    phone: "+86 21-38098888",
    phoneHref: "+862138098888",
    description: "Graduated from the same school as the Burj Khalifa in Dubai, creating a beautiful scenery for the city center skyline. The hotel features 514 guest rooms and suites, each with a modern and elegant atmosphere, and breathtaking city or river views. With over 3,200 square meters of conference space, its pillarless banquet hall and smoke-tinted glass cooking kitchen make it an ideal choice for hosting events or welcoming guests.",
    stats: [
      { value: "514", label: "Rooms & suites" },
      { value: "3,200+", label: "m² conference space" }
    ],
    cover: "assets/img/hotel-tower.jpg",
    gallery: [
      { src: "assets/img/hotel-lobby.jpg", caption: "Lobby" },
      { src: "assets/img/hotel-room.jpg", caption: "Guest room" },
      { src: "assets/img/hotel-ballroom.jpg", caption: "Conference hall" },
      { src: "assets/img/hotel-restaurant.jpg", caption: "Restaurant" },
      { src: "assets/img/hotel-dining.jpg", caption: "Dining" },
      { src: "assets/img/hotel-bar.jpg", caption: "Bar" },
      { src: "assets/img/hotel-pool.jpg", caption: "Pool" },
      { src: "assets/img/hotel-gym.jpg", caption: "Fitness centre" }
    ],
    floorPlan: "assets/img/floor-plan.jpg"
  },

  /* ---------------- Chapter 05 · Explore Shanghai ---------------- */
  places: [
    {
      id: "lujiazui", name: "Lujiazui", tag: "Financial district", image: "assets/img/lujiazui.jpg",
      text: "Lujiazui, situated on the banks of the Huangpu River in Shanghai's Pudong New District, covers an area of 31.78 square kilometers. As the core functional zone of Shanghai's International Financial Center, it hosts the China (including Hong Kong, Macao, and Taiwan) and East Asia headquarters of numerous multinational banks. Within Lujiazui, modern architectural complexes such as the Oriental Pearl Radio & TV Tower, Shanghai Tower, Shanghai World Financial Center, and Shanghai Jinmao Tower stand prominently.",
      facts: [{ label: "Area", value: "31.78 km²" }, { label: "District", value: "Pudong New District" }]
    },
    {
      id: "bund", name: "The Bund", tag: "Historic waterfront", image: "assets/img/bund.jpg",
      text: "The Bund, located along the Huangpu River in Huangpu District, Shanghai, is a Chinese historical and cultural block. Since 1844, this area was designated as a British concession, becoming a vivid portrayal of Shanghai's \"Ten-Li Foreign Field\" and marking the starting point of both the old Shanghai concessions and the city's modern urbanization.\n\nStretching 1.5 kilometers, the Bund served as a hub for Shanghai's financial and foreign trade institutions. It boasts 52 classically inspired buildings in diverse architectural styles, collectively known as the \"Bund World Architecture Exhibition.\" These structures are significant modern and contemporary historical relics and representative landmarks of Shanghai.",
      facts: [{ label: "Length", value: "1.5 km" }, { label: "Heritage buildings", value: "52" }, { label: "Since", value: "1844" }]
    },
    {
      id: "yu-garden", name: "Yu Garden", tag: "Ming Dynasty garden", image: "assets/img/yu-garden.jpg",
      text: "Yu Garden, originally a private garden from the Ming Dynasty with a history of over 450 years, exemplifies the artistic style of Southern Chinese gardens from the Ming and Qing periods — characterized by \"serene beauty, exquisite elegance, and delicate craftsmanship.\" The garden preserves a significant number of ancient trees, Ming and Qing furniture, calligraphy and paintings by renowned artists, clay sculptures, brick carvings, inscribed plaques, and couplets, all of which embody the rich essence of traditional Chinese culture and artistry. It is designated as a National AAAA-level Tourist Attraction.",
      facts: [{ label: "History", value: "450+ years" }, { label: "Rating", value: "National AAAA" }]
    },
    {
      id: "roosevelt", name: "The House of Roosevelt", tag: "Day 1 dinner venue", image: "assets/img/roosevelt.jpg",
      gallery: ["assets/img/roosevelt-interior.jpg", "assets/img/roosevelt-terrace.jpg"],
      text: "The House Of Roosevelt was built in the 1920s and is located at No. 27, The Bund, Shanghai. It is a nationally protected key cultural heritage site with a history of over a century. Today, it serves as a landmark complex integrating high-end dining, bars, and art spaces. Restored and operated by the American Roosevelt family, it offers views of the Huangpu River and the Oriental Pearl Tower, skillfully blending heritage conservation with modern style.",
      facts: [{ label: "Address", value: "No. 27, The Bund" }, { label: "Built", value: "1920s" }],
      venue: "roosevelt"
    },
    {
      id: "shanghai-tobacco", name: "Shanghai Tobacco Group", tag: "Day 1 off-site visit", image: "assets/img/shanghai-tobacco.jpg",
      text: "Shanghai Tobacco Group Co., Ltd. was established in 1984. Headquartered in Shanghai, it is a state-owned enterprise under China National Tobacco Corporation, integrating both industrial and commercial operations in cigarette manufacturing. Its business covers tobacco storage and transportation, printing, materials, and other supporting industries, and extends to logistics, hotels, and financial insurance. The company focuses on core brands such as \"Zhonghua,\" \"Zhongnanhai,\" \"Hongshuangxi,\" and \"Panda,\" and holds stakes in nearly 50 enterprises. It owns Shanghai, Beijing, and Tianjin cigarette factories as well as multiple supporting enterprises, with an annual cigarette production exceeding 2.5 million cases. Its products sell well domestically and are exported overseas. In 2013, the \"Zhonghua\" brand was selected as one of China's Top 500 Brands, and in 2016, the company ranked 115th among China's Top 500 Enterprises.",
      facts: [{ label: "Founded", value: "1984" }, { label: "Annual output", value: "2.5M+ cases" }, { label: "Holdings", value: "~50 enterprises" }],
      venue: "tobacco"
    }
  ],

  routes: [
    { name: "Heritage & shopping", stops: ["The Bund", "Nanjing Road Pedestrian Street", "Yu Garden"] },
    { name: "Skyline & riverside", stops: ["Lujiazui", "Oriental Pearl Tower", "Xuhui Riverside"] },
    { name: "Lanes & temples", stops: ["Tianzifang", "Xintiandi", "Jing'an Temple"] },
    { name: "Water town day trip", stops: ["Zhujiajiao Ancient Town"] }
  ],

  /* ---------------- Venues used in the agenda ---------------- */
  venues: {
    junior:    { name: "Junior Marquis", floor: "L1", building: "hotel", note: "Main conference hall" },
    merchant:  { name: "Merchant Kitchen", floor: "L2", building: "hotel", note: "Breakfast & lunch" },
    marquis1:  { name: "Marquis 1", floor: "L2", building: "hotel", note: "Day 1 lunch" },
    flint:     { name: "Flint", floor: "L2", building: "hotel", note: "Day 2 lunch" },
    lobby:     { name: "Hotel Lobby", floor: "", building: "hotel", note: "Meeting point & group photo" },
    hotel:     { name: "JW Marriott Marquis", floor: "", building: "hotel", note: "Return to hotel" },
    central:   { name: "Central Hotel Shanghai", floor: "", building: "offsite", note: "Welcome dinner", maps: "Central Hotel Shanghai" },
    tobacco:   { name: "Shanghai Tobacco Group", floor: "", building: "offsite", note: "Off-site visit", place: "shanghai-tobacco", maps: "Shanghai Tobacco Group" },
    roosevelt: { name: "The House of Roosevelt", floor: "", building: "offsite", note: "No. 27, The Bund", place: "roosevelt", maps: "House of Roosevelt, 27 The Bund, Shanghai" },
    airport:   { name: "Airport", floor: "", building: "offsite", note: "Departures" }
  },

  /* ---------------- Chapter 06 · Agenda ----------------
     type: talk | panel | break | meal | offsite | social | logistics
     who:  presenters as listed in the booklet                     */
  days: [
    {
      id: "d0", label: "Day 0", date: "2027-01-18", weekday: "Mon", day: "18", month: "Jan",
      title: "Arrival & welcome",
      highlight: "Welcome Dinner at Central Hotel Shanghai",
      dress: [{ when: "Welcome Dinner", what: "Smart casual" }],
      sessions: [
        { start: "17:30", dur: 60,  title: "Gather at Lobby for Departure", who: [], venue: "lobby", type: "logistics" },
        { start: "18:30", dur: 180, title: "Welcome Dinner", who: [], venue: "central", type: "social" }
      ]
    },
    {
      id: "d1", label: "Day 1", date: "2027-01-19", weekday: "Tue", day: "19", month: "Jan",
      title: "Setting the stage",
      highlight: "Keynotes from PMI and DBS · Shanghai Tobacco visit · Dinner at The House of Roosevelt",
      dress: [
        { when: "Conference", what: "Business casual (no jeans and no T-shirt)" },
        { when: "Off-site visit", what: "Please dress warmly as the weather will be below 5 °C" }
      ],
      sessions: [
        { start: "07:30", dur: 75,  title: "Breakfast", who: [], venue: "merchant", type: "meal" },
        { start: "08:45", dur: 5,   title: "Safety Brief", who: ["Hotel Staff"], venue: "junior", type: "logistics" },
        { start: "08:50", dur: 5,   title: "Welcome to Shanghai", who: ["MC"], venue: "junior", type: "talk" },
        { start: "08:55", dur: 15,  title: "2025: Year in Review", sub: "Video “Filtrona in 2025 – A Year of Transformation”", who: ["Robert"], venue: "junior", type: "talk" },
        { start: "09:10", dur: 45,  title: "PMI RRP Journey: Leading the Change Forward", who: ["Hafed Belhadj"], org: "PMI", venue: "junior", type: "talk", keynote: true },
        { start: "09:55", dur: 15,  title: "Coffee / Tea Break", who: [], venue: "junior", type: "break" },
        { start: "10:10", dur: 45,  title: "Panel: Filtrona Driving Change in RRP and Accelerating What Matters", who: ["Hafed", "Hugo", "Maaran"], venue: "junior", type: "panel" },
        { start: "10:55", dur: 90,  title: "Global Macro Economics Forecast 2026–2030", who: ["Taimur Baig"], org: "DBS", venue: "junior", type: "talk", keynote: true },
        { start: "12:25", dur: 70,  title: "Lunch", who: [], venue: "marquis1", type: "meal" },
        { start: "13:35", dur: 150, title: "Shanghai Tobacco Visit", who: ["Nie Min", "Ian"], venue: "tobacco", type: "offsite",
          notes: [
            { time: "14:45 – 15:30", text: "1st batch" },
            { time: "15:00 – 15:45", text: "2nd batch" },
            { time: "15:45", text: "Departure to hotel" }
          ] },
        { start: "16:15", dur: 40,  title: "China Tobacco Market Introduction and CTFF capabilities", who: ["Nie Min", "Ian"], venue: "junior", type: "talk" },
        { start: "16:55", dur: 125, title: "Own time before Dinner and Departure", who: ["All"], venue: "junior", type: "break" },
        { start: "19:00", dur: 180, title: "Dinner", who: [], venue: "roosevelt", type: "social" },
        { start: "22:00", dur: 30,  title: "Departure back to hotel", who: ["All"], venue: "hotel", type: "logistics" }
      ]
    },
    {
      id: "d2", label: "Day 2", date: "2027-01-20", weekday: "Wed", day: "20", month: "Jan",
      title: "Strategy & people",
      highlight: "2026 strategy, budget and regional priorities · Gala Dinner & Awards",
      dress: [
        { when: "Conference", what: "Business casual (no jeans and no T-shirt)" },
        { when: "Gala Dinner & Awards", what: "Formal attire. Encouraged to dress in the 1920s “Shanghai Tan” style" }
      ],
      sessions: [
        { start: "07:30", dur: 75,  title: "Breakfast", who: [], venue: "merchant", type: "meal" },
        { start: "08:45", dur: 5,   title: "Video Recap of Day 1", who: ["MC"], venue: "junior", type: "talk" },
        { start: "08:50", dur: 15,  title: "2026: Driving Change, Delivering Results", who: ["Robert"], venue: "junior", type: "talk" },
        { start: "09:05", dur: 20,  title: "Filtrona from the Shareholder Perspective", who: ["Jens"], venue: "junior", type: "talk" },
        { start: "09:25", dur: 40,  title: "Roundtable discussion: Strategic Update 2026", who: ["Robert", "Paddy", "Jens", "LM"], venue: "junior", type: "panel" },
        { start: "10:05", dur: 30,  title: "2026 Budget", who: ["Tushar", "Gary"], venue: "junior", type: "talk" },
        { start: "10:35", dur: 15,  title: "Coffee / Tea Break", who: [], venue: "junior", type: "break" },
        { start: "10:50", dur: 60,  title: "Winning 2026: Regional Priorities for High-Velocity Growth", who: ["Sandy", "Kerim"], venue: "junior", type: "talk" },
        { start: "11:50", dur: 25,  title: "Sales Empowered: Capabilities That Accelerate Growth", who: ["Roxana"], venue: "junior", type: "talk" },
        { start: "12:15", dur: 15,  title: "Q&A with Commercial leads", who: ["Robert", "Sandy", "Kerim", "Roxana"], venue: "junior", type: "panel" },
        { start: "12:30", dur: 50,  title: "Lunch", who: [], venue: "flint", type: "meal" },
        { start: "13:20", dur: 60,  title: "Building A Future-Ready Workforce", who: ["HR Team"], venue: "junior", type: "talk" },
        { start: "14:20", dur: 30,  title: "Building the Future: Supply Chain Strategic Priorities for Transformation", who: ["Jennifer"], venue: "junior", type: "talk" },
        { start: "14:50", dur: 25,  title: "Tea Ceremony Break", who: [], venue: "junior", type: "break" },
        { start: "15:15", dur: 25,  title: "Building the Future: FEM Strategic Priorities for Transformation", who: ["Sergio", "Ihsan"], venue: "junior", type: "talk" },
        { start: "15:40", dur: 25,  title: "Building the Future: NPI and Quality Strategic Levers for Business Growth", who: ["Sergio", "Mable"], venue: "junior", type: "talk" },
        { start: "16:05", dur: 25,  title: "Q&A with Ops & SC leads", who: ["Jenn", "Ulas", "Ihsan", "Sergio", "Mable"], venue: "junior", type: "panel" },
        { start: "16:30", dur: 45,  title: "HvL Presentation", who: ["Daniel Einhäuser", "Georges Krombach"], org: "HvL", venue: "junior", type: "talk", keynote: true },
        { start: "17:15", dur: 75,  title: "Own time before Gala Dinner", who: ["All"], venue: "junior", type: "break" },
        { start: "18:30", dur: 30,  title: "Group Photo", who: ["Doreen"], venue: "lobby", type: "logistics" },
        { start: "19:00", dur: 180, title: "Gala Dinner and Awards", who: [], venue: "junior", type: "social", dressNote: "Formal attire" }
      ]
    },
    {
      id: "d3", label: "Day 3", date: "2027-01-21", weekday: "Thu", day: "21", month: "Jan",
      title: "Innovation & close",
      highlight: "Driving innovation: RRP and Combustibles · Project NOVA · Conference closure",
      dress: [{ when: "Conference", what: "Business casual (no jeans and no T-shirt)" }],
      sessions: [
        { start: "07:30", dur: 90,  title: "Breakfast", who: [], venue: "merchant", type: "meal" },
        { start: "09:00", dur: 15,  title: "Video Recap of Day 2", who: ["MC"], venue: "junior", type: "talk" },
        { start: "09:15", dur: 30,  title: "Driving innovation to support growth: RRP", who: ["Hugo", "Maaran"], venue: "junior", type: "talk" },
        { start: "09:45", dur: 20,  title: "Driving innovation to support growth: Combustibles", who: ["Hugo", "Maaran"], venue: "junior", type: "talk" },
        { start: "10:05", dur: 20,  title: "Driving innovation to support growth: Q&A", who: ["Hugo", "Maaran"], venue: "junior", type: "panel" },
        { start: "10:25", dur: 15,  title: "Coffee Break", who: [], venue: "junior", type: "break" },
        { start: "10:40", dur: 60,  title: "Delivering Complex Projects", sub: "Project NOVA — Lessons from Thailand", who: ["Soon Kit", "Pitak"], venue: "junior", type: "talk" },
        { start: "11:40", dur: 10,  title: "Conference closure", who: ["Robert"], venue: "junior", type: "talk" },
        { start: "11:50", dur: 60,  title: "Lunch", who: [], venue: "merchant", type: "meal" },
        { start: "12:50", dur: 0,   timeLabel: "After lunch", title: "Departure to Airport", who: [], venue: "airport", type: "logistics" }
      ]
    }
  ],

  /* ---------------- Chapter 09 · External speakers ----------------
     aliases: names used in the agenda that should link to this profile */
  speakers: [
    {
      id: "hafed", name: "Hafed Belhadj", role: "Chief Procurement Officer", org: "Philip Morris International",
      photo: "assets/img/sp-hafed.jpg", aliases: ["Hafed Belhadj", "Hafed"],
      bio: [
        "Hafed Belhadj was the Chief Procurement Officer of Philip Morris International (PMI) from 2018 until his retirement earlier this year. Prior to that, he was Vice President (VP), Global Supply Chain, VP Operations EU & EEMA, and VP Operations Planning.",
        "He started his career with the General Electric Company where he had several roles of increasing responsibility in Operations, Strategy and General Management. Mr. Belhadj is passionate about technology, innovation and building teams.",
        "Since his retirement, he has been involved in advising senior executives on various supply chain and geopolitical topics. In addition, he is involved in a number of innovative startups as an investor and advisor."
      ]
    },
    {
      id: "taimur", name: "Taimur Baig", honorific: "Dr.", role: "Chief Economist", org: "DBS",
      photo: "assets/img/sp-taimur.jpg", aliases: ["Taimur Baig", "Taimur"],
      bio: [
        "Dr. Taimur Baig leads global economics and macro strategy at DBS Group Research. With experience at the Monetary Authority of Singapore, Deutsche Bank, and the IMF, he offers valuable insights on monetary policy, digital currency, and the 2025 economic outlook."
      ]
    },
    {
      id: "daniel", name: "Daniel Einhäuser", role: "Chief Executive Officer", org: "Landewyck Tobacco S.A.",
      photo: "assets/img/sp-daniel.jpg", aliases: ["Daniel Einhäuser", "Daniel"],
      bio: [
        "Daniel assumed the CEO position at Landewyck Tobacco S.A. in July 2023, leading the tobacco business of the Luxemburgish Group that has been founded in 1847.",
        "He joined the tobacco industry in 1995 at Reemtsma GmbH in Hamburg, Germany, that was sold in 2002 to Imperial Tobacco plc. He worked in finance, business development, sales & marketing and general management. In 2008 Daniel took over as Regional Director Eastern Europe for Imperial until he left the Group in 2013.",
        "Spending 10 years outside the tobacco industry with Bitburger breweries as MD for König Brauerei and CEO for the mineral water company Gehring Bunte GmbH, he re-joined one of the most controversial and yet most exciting industries as CEO for Landewyck."
      ]
    },
    {
      id: "georges", name: "Georges Krombach", role: "Chief Commercial Officer", org: "Landewyck Tobacco S.A.",
      photo: "assets/img/sp-georges.jpg", aliases: ["Georges Krombach", "Georges"],
      bio: [
        "Georges Krombach began his career with the L'Oréal cosmetics group in Hong Kong and Paris. In 2010, he joined the family-owned Landewyck Group in Luxembourg, which is active in consumer goods, wholesale and real estate in more than 40 countries. He is now Chief Commercial Officer of Landewyck Tobacco S.A.",
        "Georges is currently Vice-President of the Family Business Network Luxembourg, President of the Luxembourgish Scouting Federation and sits on various boards of Luxembourg businesses."
      ]
    },
    {
      id: "zsofia", name: "Zsofia Balatoni", label: "Moderator", role: "Chief Strategy Officer (CSO) & Co-Founder", org: "Rothman & Roman",
      photo: "assets/img/sp-zsofia.jpg", aliases: ["Zsofia Balatoni"],
      bio: [
        "Zsofia is a communication expert with 20+ years of experience in strategic communications and ESG. She founded Rothman & Roman, an award-winning agency known for purpose-driven campaigns with clients like Mastercard, Microsoft, Heineken and more."
      ]
    }
  ],

  /* Agenda names that link to the CEO welcome page */
  ceoAliases: ["Robert", "Robert Pye"],
  /* Agenda names that are roles, not people (not listed as presenters) */
  nonPeople: ["All", "MC", "Hotel Staff", "HR Team"],

  /* ---------------- Chapter 10 · Useful information ---------------- */
  emergency: [
    { label: "Police", number: "110" },
    { label: "Ambulance", number: "120" },
    { label: "Fire Department", number: "119" },
    { label: "Tourist Complaint Hotline", number: "12345" }
  ]
};
