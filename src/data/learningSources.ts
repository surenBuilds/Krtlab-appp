export type LearningSource = { title: string; url: string; type: "official"|"university"|"textbook"|"professional"|"reference"; useFor: string[]; };
export type LearningSourceCatalog = { books: LearningSource[]; web: LearningSource[]; };

const FAMILY: Record<string, LearningSourceCatalog> = {
  finance: {
    books: [
      {title:"Principles of Corporate Finance",url:"https://www.mheducation.com/highered/product/principles-of-corporate-finance-brealey.html",type:"textbook",useFor:["finance","corporate-finance","investments"]},
      {title:"The Economics of Money, Banking and Financial Markets",url:"https://www.pearson.com/en-us/subject-catalog/p/economics-of-money-banking-and-financial-markets/P200000005969",type:"textbook",useFor:["banking","economics"]},
      {title:"The Psychology of Money",url:"https://www.morganhousel.com/the-psychology-of-money",type:"reference",useFor:["personal-finance","financial-thinking"]}
    ],
    web:[
      {title:"International Monetary Fund",url:"https://www.imf.org/en/Topics",type:"official",useFor:["economics","finance"]},
      {title:"World Bank Open Knowledge Repository",url:"https://openknowledge.worldbank.org/",type:"official",useFor:["economics","development"]},
      {title:"CFA Institute",url:"https://www.cfainstitute.org/insights",type:"professional",useFor:["investments","corporate-finance"]},
      {title:"Federal Reserve Education",url:"https://www.federalreserve.gov/education.htm",type:"official",useFor:["banking","economics"]}
    ]
  },
  business: {
    books:[
      {title:"The Lean Startup",url:"https://theleanstartup.com/",type:"reference",useFor:["entrepreneurship","startups"]},
      {title:"Marketing Management",url:"https://www.pearson.com/en-us/subject-catalog/p/marketing-management/P200000006041",type:"textbook",useFor:["marketing"]},
      {title:"SPIN Selling",url:"https://www.mheducation.com/highered/product/spin-selling-rackham.html",type:"textbook",useFor:["sales"]}
    ],
    web:[
      {title:"Harvard Business School Online",url:"https://online.hbs.edu/",type:"university",useFor:["business","strategy","management"]},
      {title:"MIT OpenCourseWare — Sloan School",url:"https://ocw.mit.edu/search/?d=Sloan%20School%20of%20Management",type:"university",useFor:["business","management"]},
      {title:"Y Combinator Startup Library",url:"https://www.ycombinator.com/library",type:"professional",useFor:["entrepreneurship","startups"]},
      {title:"U.S. Small Business Administration Learning Center",url:"https://www.sba.gov/learning-platform",type:"official",useFor:["small-business-management"]}
    ]
  },
  tech: {
    books:[
      {title:"Structure and Interpretation of Computer Programs",url:"https://mitpress.mit.edu/9780262510875/structure-and-interpretation-of-computer-programs/",type:"textbook",useFor:["programming","computer-science"]},
      {title:"Designing Data-Intensive Applications",url:"https://dataintensive.net/",type:"reference",useFor:["data-analysis","cloud-computing"]},
      {title:"Computer Networking: A Top-Down Approach",url:"https://gaia.cs.umass.edu/kurose_ross/index.php",type:"textbook",useFor:["networking","cloud-computing"]}
    ],
    web:[
      {title:"Python Documentation",url:"https://docs.python.org/3/",type:"official",useFor:["python"]},
      {title:"MDN Web Docs",url:"https://developer.mozilla.org/en-US/docs/Learn_web_development",type:"official",useFor:["javascript","web-development"]},
      {title:"W3C Standards",url:"https://www.w3.org/standards/",type:"official",useFor:["web-development"]},
      {title:"OWASP",url:"https://owasp.org/",type:"professional",useFor:["cybersecurity"]},
      {title:"NIST Cybersecurity Framework",url:"https://www.nist.gov/cyberframework",type:"official",useFor:["cybersecurity"]},
      {title:"AWS Documentation",url:"https://docs.aws.amazon.com/",type:"official",useFor:["cloud-computing"]},
      {title:"Hugging Face Learn",url:"https://huggingface.co/learn",type:"professional",useFor:["ai","machine-learning"]}
    ]
  },
  math: {
    books:[
      {title:"OpenStax Algebra and Trigonometry",url:"https://openstax.org/details/books/algebra-and-trigonometry-2e",type:"textbook",useFor:["algebra","trigonometry"]},
      {title:"OpenStax Calculus Volume 1",url:"https://openstax.org/details/books/calculus-volume-1",type:"textbook",useFor:["calculus"]},
      {title:"OpenIntro Statistics",url:"https://www.openintro.org/book/os/",type:"textbook",useFor:["statistics"]}
    ],
    web:[
      {title:"MIT OpenCourseWare Mathematics",url:"https://ocw.mit.edu/search/?d=Mathematics",type:"university",useFor:["mathematics"]},
      {title:"Khan Academy Math",url:"https://www.khanacademy.org/math",type:"reference",useFor:["mathematics"]},
      {title:"NIST Digital Library of Mathematical Functions",url:"https://dlmf.nist.gov/",type:"official",useFor:["mathematics"]}
    ]
  },
  science: {
    books:[
      {title:"OpenStax Physics",url:"https://openstax.org/subjects/science",type:"textbook",useFor:["physics"]},
      {title:"OpenStax Chemistry 2e",url:"https://openstax.org/details/books/chemistry-2e",type:"textbook",useFor:["chemistry"]},
      {title:"OpenStax Biology 2e",url:"https://openstax.org/details/books/biology-2e",type:"textbook",useFor:["biology"]}
    ],
    web:[
      {title:"NASA Science",url:"https://science.nasa.gov/",type:"official",useFor:["astronomy","space","physics"]},
      {title:"National Institute of Standards and Technology",url:"https://www.nist.gov/",type:"official",useFor:["physics","chemistry"]},
      {title:"National Center for Biotechnology Information",url:"https://www.ncbi.nlm.nih.gov/",type:"official",useFor:["biology","medicine"]},
      {title:"NOAA Education",url:"https://www.noaa.gov/education",type:"official",useFor:["ecology","geography","earth-science"]}
    ]
  },
  humanities: {
    books:[
      {title:"The Stanford Encyclopedia of Philosophy",url:"https://plato.stanford.edu/",type:"reference",useFor:["philosophy"]},
      {title:"The Norton Anthology of World Literature",url:"https://wwnorton.com/college/english/nael/",type:"textbook",useFor:["world-literature"]},
      {title:"The Cambridge History series",url:"https://www.cambridge.org/core/what-we-publish/collections/cambridge-histories",type:"textbook",useFor:["history","literature"]}
    ],
    web:[
      {title:"Stanford Encyclopedia of Philosophy",url:"https://plato.stanford.edu/",type:"university",useFor:["philosophy"]},
      {title:"Encyclopaedia Britannica",url:"https://www.britannica.com/",type:"reference",useFor:["history","geography","humanities"]},
      {title:"Library of Congress",url:"https://www.loc.gov/",type:"official",useFor:["history","literature"]},
      {title:"UNESCO",url:"https://www.unesco.org/en",type:"official",useFor:["education","culture","history"]}
    ]
  },
  law: {
    books:[
      {title:"The Oxford Handbook of Comparative Law",url:"https://academic.oup.com/edited-volume/34378",type:"textbook",useFor:["comparative-law","international-law"]},
      {title:"International Law",url:"https://global.oup.com/academic/",type:"textbook",useFor:["international-law"]},
      {title:"Legal Research in a Nutshell",url:"https://store.westacademic.com/",type:"textbook",useFor:["legal-research"]}
    ],
    web:[
      {title:"ARLIS — Armenian Legal Information System",url:"https://www.arlis.am/",type:"official",useFor:["armenian-law","general-law","civil-law","criminal-law","business-law"]},
      {title:"Cornell Legal Information Institute",url:"https://www.law.cornell.edu/",type:"university",useFor:["law"]},
      {title:"United Nations — International Law",url:"https://legal.un.org/",type:"official",useFor:["international-law","human-rights"]},
      {title:"European Court of Human Rights",url:"https://www.echr.coe.int/",type:"official",useFor:["human-rights"]}
    ]
  },
  arts: {
    books:[
      {title:"The Story of Art",url:"https://www.penguinrandomhouse.com/books/55209/the-story-of-art-by-e-h-gombrich/",type:"reference",useFor:["art","drawing"]},
      {title:"Design of Everyday Things",url:"https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded/",type:"reference",useFor:["design","ui-ux"]},
      {title:"The Animator's Survival Kit",url:"https://www.theanimatorssurvivalkit.com/",type:"reference",useFor:["animation","media"]}
    ],
    web:[
      {title:"MoMA Learning",url:"https://www.moma.org/learn/moma_learning/",type:"reference",useFor:["art","design"]},
      {title:"The Metropolitan Museum of Art",url:"https://www.metmuseum.org/art/online-features/metkids/",type:"reference",useFor:["art","history"]},
      {title:"Adobe Learn",url:"https://helpx.adobe.com/learn.html",type:"professional",useFor:["design","media"]}
    ]
  },
  languages: {
    books:[
      {title:"Common European Framework of Reference for Languages",url:"https://www.coe.int/en/web/common-european-framework-reference-languages",type:"official",useFor:["languages"]},
      {title:"How Languages are Learned",url:"https://global.oup.com/academic/",type:"textbook",useFor:["language-learning"]}
    ],
    web:[
      {title:"Council of Europe — CEFR",url:"https://www.coe.int/en/web/common-european-framework-reference-languages",type:"official",useFor:["languages"]},
      {title:"Cambridge Dictionary",url:"https://dictionary.cambridge.org/",type:"reference",useFor:["english"]},
      {title:"British Council LearnEnglish",url:"https://learnenglish.britishcouncil.org/",type:"professional",useFor:["english"]},
      {title:"Instituto Cervantes",url:"https://cvc.cervantes.es/",type:"official",useFor:["spanish"]},
      {title:"Goethe-Institut",url:"https://www.goethe.de/",type:"official",useFor:["german"]},
      {title:"Alliance Française",url:"https://www.alliancefr.org/",type:"professional",useFor:["french"]},
      {title:"Chinese Language Council International",url:"https://www.chinese.cn/",type:"official",useFor:["chinese"]}
    ]
  },
  space: {
    books:[
      {title:"Introduction to Space Science",url:"https://www.cambridge.org/core/",type:"textbook",useFor:["space","astronomy"]},
      {title:"Space Mission Engineering: The New SMAD",url:"https://www.spacex.com/",type:"reference",useFor:["space-tech","satellites"]}
    ],
    web:[
      {title:"NASA",url:"https://www.nasa.gov/",type:"official",useFor:["space","astronomy","aerospace"]},
      {title:"ESA",url:"https://www.esa.int/",type:"official",useFor:["space","satellites"]},
      {title:"UNOOSA",url:"https://www.unoosa.org/",type:"official",useFor:["space-policy","space-law"]},
      {title:"NASA Earthdata",url:"https://www.earthdata.nasa.gov/",type:"official",useFor:["remote-sensing","satellite-data"]}
    ]
  },
  engineering: {
    books:[
      {title:"Engineering Mechanics: Dynamics",url:"https://www.mheducation.com/",type:"textbook",useFor:["mechanics","engineering"]},
      {title:"Materials Science and Engineering",url:"https://www.wiley.com/",type:"textbook",useFor:["materials-science"]},
      {title:"Introduction to Robotics: Mechanics and Control",url:"https://www.pearson.com/",type:"textbook",useFor:["robotics"]}
    ],
    web:[
      {title:"MIT OpenCourseWare Engineering",url:"https://ocw.mit.edu/search/?q=engineering",type:"university",useFor:["engineering"]},
      {title:"IEEE",url:"https://www.ieee.org/",type:"professional",useFor:["engineering","robotics","automation"]},
      {title:"NIST",url:"https://www.nist.gov/",type:"official",useFor:["manufacturing","quality-control","materials"]},
      {title:"ASME",url:"https://www.asme.org/",type:"professional",useFor:["mechanical-engineering","manufacturing"]}
    ]
  },
  aviation: {
    books:[
      {title:"Pilot's Handbook of Aeronautical Knowledge",url:"https://www.faa.gov/regulations_policies/handbook",type:"official",useFor:["aviation","navigation"]},
      {title:"Airplane Flying Handbook",url:"https://www.faa.gov/regulations_policies/handbook",type:"official",useFor:["aviation"] }
    ],
    web:[
      {title:"FAA",url:"https://www.faa.gov/",type:"official",useFor:["aviation","aircraft"]},
      {title:"ICAO",url:"https://www.icao.int/",type:"official",useFor:["aviation","air-navigation"]},
      {title:"EASA",url:"https://www.easa.europa.eu/",type:"official",useFor:["aviation-safety","aircraft"]}
    ]
  },
  transport: {
    books:[
      {title:"Transportation Engineering",url:"https://www.pearson.com/",type:"textbook",useFor:["transport","traffic"]},
      {title:"Supply Chain Management",url:"https://www.mheducation.com/",type:"textbook",useFor:["logistics","warehousing"]}
    ],
    web:[
      {title:"World Bank Transport",url:"https://www.worldbank.org/en/topic/transport",type:"official",useFor:["transport","logistics"]},
      {title:"UNECE Transport",url:"https://unece.org/transport",type:"official",useFor:["transport","road-transport"]},
      {title:"U.S. Department of Transportation",url:"https://www.transportation.gov/",type:"official",useFor:["transport","infrastructure"]}
    ]
  },
  urban: {
    books:[
      {title:"The Image of the City",url:"https://mitpress.mit.edu/9780262620017/the-image-of-the-city/",type:"textbook",useFor:["urban-design"]},
      {title:"Cities for People",url:"https://islandpress.org/books/cities-people",type:"reference",useFor:["urban-planning"]}
    ],
    web:[
      {title:"UN-Habitat",url:"https://unhabitat.org/",type:"official",useFor:["urban-planning","cities"]},
      {title:"World Bank Urban Development",url:"https://www.worldbank.org/en/topic/urbandevelopment",type:"official",useFor:["urban-development"]},
      {title:"NACTO",url:"https://nacto.org/",type:"professional",useFor:["transport","urban-design"]}
    ]
  },
  education: {
    books:[
      {title:"How People Learn II",url:"https://nap.nationalacademies.org/catalog/24783/how-people-learn-ii-learners-contexts-and-cultures",type:"reference",useFor:["education","learning-science"]},
      {title:"Visible Learning",url:"https://www.routledge.com/",type:"textbook",useFor:["education","assessment"]}
    ],
    web:[
      {title:"UNESCO Education",url:"https://www.unesco.org/en/education",type:"official",useFor:["education"]},
      {title:"OECD Education",url:"https://www.oecd.org/education/",type:"official",useFor:["education","assessment"]},
      {title:"National Academies — How People Learn",url:"https://www.nationalacademies.org/hpl",type:"reference",useFor:["learning-science"]}
    ]
  }
};

const SPECIAL: Record<string, LearningSourceCatalog> = {
  "armenian-history": {books:[{title:"Հայ ժողովրդի պատմություն",url:"https://www.ysu.am/",type:"textbook",useFor:["armenian-history"]}],web:[{title:"ARIS — Armenian Research Institute",url:"https://www.matenadaran.am/",type:"reference",useFor:["armenian-history"]},{title:"History Museum of Armenia",url:"https://historymuseum.am/",type:"official",useFor:["armenian-history"]}]},
  "world-history": {books:[],web:[{title:"Encyclopaedia Britannica — History",url:"https://www.britannica.com/topic/history",type:"reference",useFor:["world-history"]},{title:"Library of Congress",url:"https://www.loc.gov/",type:"official",useFor:["world-history"]}]},
  "astronomy-observation": {books:[],web:[{title:"NASA Science",url:"https://science.nasa.gov/universe/",type:"official",useFor:["astronomy"]},{title:"ESA Science",url:"https://www.esa.int/Science_Exploration/Space_Science",type:"official",useFor:["astronomy"]}]},
  "satellite-data-remote-sensing": {books:[],web:[{title:"NASA Earthdata",url:"https://www.earthdata.nasa.gov/",type:"official",useFor:["remote-sensing"]},{title:"USGS EarthExplorer",url:"https://earthexplorer.usgs.gov/",type:"official",useFor:["remote-sensing","geospatial-data"]}]},
  "human-rights": {books:[],web:[{title:"OHCHR",url:"https://www.ohchr.org/",type:"official",useFor:["human-rights"]},{title:"European Court of Human Rights",url:"https://www.echr.coe.int/",type:"official",useFor:["human-rights"]}]},
  "intellectual-property": {books:[],web:[{title:"WIPO",url:"https://www.wipo.int/",type:"official",useFor:["intellectual-property"]}]},
};

export const LEARNING_SOURCE_CATALOG = FAMILY;

export function getLearningSources(category: string, subfield: string): string {
  const key = subfield.toLowerCase();
  const direct = SPECIAL[key];
  const familyKey = category === "finance" ? "finance" : category === "business" ? "business" : category === "tech" ? "tech" :
    category === "math" ? "math" : category === "natural-sciences" ? "science" : category === "humanities" ? "humanities" :
    category === "law" ? "law" : category === "creative-arts" ? "arts" : category === "languages" ? "languages" :
    category === "space" ? "space" : category === "aviation" ? "aviation" : category === "transport" ? "transport" :
    category === "urban-planning" ? "urban" : category === "industry" ? "engineering" : category === "education" ? "education" : "humanities";
  const catalog = direct || FAMILY[familyKey];
  const relevantBooks = catalog.books.filter(x => !x.useFor.length || x.useFor.some(v => key.includes(v) || v.includes(key)));
  const relevantWeb = catalog.web.filter(x => !x.useFor.length || x.useFor.some(v => key.includes(v) || v.includes(key)));
  const books = (relevantBooks.length ? relevantBooks : catalog.books).slice(0, 4);
  const web = (relevantWeb.length ? relevantWeb : catalog.web).slice(0, 6);
  return [
    "Books:",
    ...books.map(x => `- ${x.title} [${x.type}] — ${x.url}`),
    "Web sources:",
    ...web.map(x => `- ${x.title} [${x.type}] — ${x.url}`)
  ].join("\n");
}
