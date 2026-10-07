import { BookReference } from '../types';

type AcademicPack = {
  beginner: BookReference[];
  intermediate: BookReference[];
  advanced: BookReference[];
};

const PACKS: Record<string, AcademicPack> = {
  tech: {
    beginner: [
      { title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson & Gerald Jay Sussman (MIT)', description: 'Foundational computer science text developed from MIT teaching.' },
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest & Clifford Stein', description: 'Core university reference for algorithms and data structures; closely associated with MIT computer science.' }
    ],
    intermediate: [
      { title: 'Computer Systems: A Programmer’s Perspective', author: 'Randal E. Bryant & David R. O’Hallaron (Carnegie Mellon)', description: 'University-level treatment of how programs execute on modern computer systems.' },
      { title: 'Computer Networking: A Top-Down Approach', author: 'James F. Kurose & Keith W. Ross', description: 'Widely used academic treatment of networking from applications down to physical infrastructure.' }
    ],
    advanced: [
      { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann (University of Cambridge)', description: 'Advanced treatment of reliable, scalable and maintainable data systems.' },
      { title: 'Operating System Concepts', author: 'Abraham Silberschatz, Peter B. Galvin & Greg Gagne', description: 'Comprehensive university reference for operating-system architecture and design.' }
    ]
  },
  ai: {
    beginner: [
      { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell (UC Berkeley) & Peter Norvig (Stanford)', description: 'Major academic reference covering the foundations of artificial intelligence.' },
      { title: 'The Elements of Statistical Learning', author: 'Trevor Hastie, Robert Tibshirani & Jerome Friedman (Stanford)', description: 'Foundational statistical-learning reference used in advanced university study.' }
    ],
    intermediate: [
      { title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio & Aaron Courville', description: 'Academic reference covering neural networks and modern deep learning.' },
      { title: 'Pattern Recognition and Machine Learning', author: 'Christopher M. Bishop', description: 'Rigorous university treatment of probabilistic machine learning and pattern recognition.' }
    ],
    advanced: [
      { title: 'Reinforcement Learning: An Introduction', author: 'Richard S. Sutton & Andrew G. Barto', description: 'Standard academic foundation for reinforcement learning; also used in Stanford coursework.' },
      { title: 'Probabilistic Graphical Models', author: 'Daphne Koller (Stanford) & Nir Friedman', description: 'Advanced treatment of Bayesian networks, graphical models and probabilistic reasoning.' }
    ]
  },
  business: {
    beginner: [
      { title: 'Marketing Management', author: 'Philip Kotler (Northwestern) & Kevin Lane Keller', description: 'Core academic framework for marketing strategy and management.' },
      { title: 'Entrepreneurship', author: 'Robert D. Hisrich, Michael P. Peters & Dean A. Shepherd', description: 'University-level introduction to entrepreneurial opportunity, venture creation and growth.' }
    ],
    intermediate: [
      { title: 'Competitive Strategy', author: 'Michael E. Porter (Harvard Business School)', description: 'Foundational academic framework for industry analysis and competitive positioning.' },
      { title: 'Strategic Management', author: 'Frank T. Rothaermel (Georgia Tech)', description: 'Evidence-based university text covering strategy, innovation and competitive advantage.' }
    ],
    advanced: [
      { title: 'The Innovator’s Dilemma', author: 'Clayton M. Christensen (Harvard Business School)', description: 'Seminal academic work on disruptive innovation and incumbent firms.' },
      { title: 'The Theory of the Growth of the Firm', author: 'Edith Penrose', description: 'Foundational scholarly work on firm growth, capabilities and managerial resources.' }
    ]
  },
  economics: {
    beginner: [
      { title: 'Principles of Economics', author: 'N. Gregory Mankiw (Harvard)', description: 'Standard university introduction to microeconomics and macroeconomics.' },
      { title: 'Intermediate Microeconomics', author: 'Hal R. Varian (UC Berkeley)', description: 'Rigorous academic treatment of consumer, producer and market behavior.' }
    ],
    intermediate: [
      { title: 'Macroeconomics', author: 'Olivier Blanchard (MIT)', description: 'University-level framework for macroeconomic models, policy and economic fluctuations.' },
      { title: 'Introduction to Modern Economic Growth', author: 'Daron Acemoglu (MIT)', description: 'Advanced foundation for economic growth theory; used in MIT economics coursework.' }
    ],
    advanced: [
      { title: 'Microeconomic Theory', author: 'Andreu Mas-Colell, Michael D. Whinston & Jerry R. Green', description: 'Graduate-level reference for modern microeconomic theory.' },
      { title: 'Econometric Analysis', author: 'William H. Greene', description: 'Advanced reference for econometric theory and empirical analysis.' }
    ]
  },
  finance: {
    beginner: [
      { title: 'Principles of Corporate Finance', author: 'Richard A. Brealey, Stewart C. Myers & Franklin Allen', description: 'Core university reference for corporate finance and financial decision-making.' },
      { title: 'Investments', author: 'Zvi Bodie, Alex Kane & Alan J. Marcus', description: 'Academic introduction to portfolio theory, securities and investment analysis.' }
    ],
    intermediate: [
      { title: 'Corporate Finance', author: 'Jonathan Berk (Stanford) & Peter DeMarzo (Stanford)', description: 'Evidence-based academic treatment of valuation, capital structure and financial decisions.' },
      { title: 'Investment Science', author: 'David G. Luenberger (Stanford)', description: 'Mathematical framework for investment and portfolio decisions.' }
    ],
    advanced: [
      { title: 'Asset Pricing', author: 'John H. Cochrane (University of Chicago)', description: 'Graduate-level treatment of modern asset-pricing theory.' },
      { title: 'Options, Futures, and Other Derivatives', author: 'John C. Hull', description: 'Advanced university reference for derivatives and risk management.' }
    ]
  },
  psychology: {
    beginner: [
      { title: 'Psychology', author: 'Daniel L. Schacter, Daniel T. Gilbert & Matthew K. Nock (Harvard)', description: 'Research-based introduction to major areas of psychological science.' },
      { title: 'Cognitive Psychology', author: 'Robert J. Sternberg & Karin Sternberg', description: 'Academic foundation for perception, memory, reasoning and decision-making.' }
    ],
    intermediate: [
      { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman (Princeton)', description: 'Influential synthesis of research on judgment, decision-making and cognitive biases.' },
      { title: 'Social Psychology', author: 'David G. Myers & C. Nathan DeWall', description: 'University-level treatment of social cognition, influence and behavior.' }
    ],
    advanced: [
      { title: 'Learning and Behavior', author: 'Paul Chance', description: 'Academic treatment of learning mechanisms and behavioral principles.' },
      { title: 'Principles of Neural Science', author: 'Eric R. Kandel et al. (Columbia)', description: 'Advanced reference connecting behavior, cognition and neuroscience.' }
    ]
  },
  politics: {
    beginner: [
      { title: 'Political Science', author: 'John T. Ishiyama', description: 'University-level introduction to political institutions, behavior and comparative politics.' },
      { title: 'The Globalization of World Politics', author: 'John Baylis, Steve Smith & Patricia Owens', description: 'Comprehensive introduction to international relations and global politics.' }
    ],
    intermediate: [
      { title: 'The End of History and the Last Man', author: 'Francis Fukuyama (Stanford)', description: 'Influential political-science work on institutions, ideology and political development.' },
      { title: 'Making Democracy Work', author: 'Robert D. Putnam (Harvard)', description: 'Research-based study of institutions, civic engagement and democratic performance.' }
    ],
    advanced: [
      { title: 'The Logic of Political Survival', author: 'Bruce Bueno de Mesquita et al.', description: 'Formal and empirical framework for political institutions and leader incentives.' },
      { title: 'After Hegemony', author: 'Robert O. Keohane (Princeton)', description: 'Foundational international-relations analysis of cooperation and institutions.' }
    ]
  },
  philosophy: {
    beginner: [
      { title: 'Justice: What’s the Right Thing to Do?', author: 'Michael J. Sandel (Harvard)', description: 'Accessible university-level introduction to major traditions in moral and political philosophy.' },
      { title: 'The Fundamentals of Ethics', author: 'Shafer-Landau', description: 'Structured academic introduction to ethical theories and moral reasoning.' }
    ],
    intermediate: [
      { title: 'A Theory of Justice', author: 'John Rawls (Harvard)', description: 'Foundational work in modern political philosophy and theories of justice.' },
      { title: 'Nicomachean Ethics', author: 'Aristotle', description: 'Primary philosophical text on virtue, character and human flourishing.' }
    ],
    advanced: [
      { title: 'The Republic', author: 'Plato', description: 'Foundational primary text on justice, knowledge, politics and education.' },
      { title: 'The Problems of Philosophy', author: 'Bertrand Russell', description: 'Classic analytical introduction to epistemological and metaphysical problems.' }
    ]
  },
  science: {
    beginner: [
      { title: 'University Physics', author: 'Young & Freedman', description: 'Comprehensive undergraduate foundation in classical and modern physics.' },
      { title: 'Chemistry: The Molecular Science', author: 'John W. Moore et al.', description: 'University-level introduction to molecular structure, reactions and chemical reasoning.' }
    ],
    intermediate: [
      { title: 'Fundamentals of Physics', author: 'David Halliday, Robert Resnick & Jearl Walker', description: 'Rigorous undergraduate physics reference with quantitative problem solving.' },
      { title: 'Biochemistry', author: 'Jeremy M. Berg, John L. Tymoczko, Gregory Gatto & Lubert Stryer', description: 'Academic foundation for molecular biology and biochemistry.' }
    ],
    advanced: [
      { title: 'Introduction to Electrodynamics', author: 'David J. Griffiths', description: 'Standard advanced undergraduate/graduate reference for electromagnetism.' },
      { title: 'Modern Quantum Mechanics', author: 'J. J. Sakurai & Jim Napolitano', description: 'Advanced university treatment of quantum mechanics.' }
    ]
  },
  engineering: {
    beginner: [
      { title: 'Engineering Mechanics: Dynamics', author: 'J. L. Meriam & L. G. Kraige', description: 'University foundation in engineering mechanics and problem solving.' },
      { title: 'Materials Science and Engineering: An Introduction', author: 'William D. Callister Jr. & David Rethwisch', description: 'Standard undergraduate introduction to engineering materials.' }
    ],
    intermediate: [
      { title: 'Introduction to Robotics: Mechanics and Control', author: 'John J. Craig', description: 'University-level foundation in robot kinematics, dynamics and control.' },
      { title: 'Feedback Systems', author: 'Karl J. Åström & Richard M. Murray (Caltech)', description: 'Rigorous treatment of feedback and control systems; available openly online.' }
    ],
    advanced: [
      { title: 'Modern Control Engineering', author: 'Katsuhiko Ogata', description: 'Advanced university reference for control-system analysis and design.' },
      { title: 'Fundamentals of Materials Science and Engineering', author: 'William F. Smith & Javad Hashemi', description: 'Advanced engineering treatment of material structure and properties.' }
    ]
  },
  space: {
    beginner: [
      { title: 'An Introduction to Modern Astrophysics', author: 'Bradley W. Carroll & Dale A. Ostlie', description: 'Comprehensive university foundation in astrophysics and astronomical phenomena.' },
      { title: 'Orbital Mechanics for Engineering Students', author: 'Howard D. Curtis', description: 'Engineering-oriented foundation for orbital mechanics and spacecraft trajectories.' }
    ],
    intermediate: [
      { title: 'Space Mission Engineering: The New SMAD', author: 'James R. Wertz, David Everett & Jeffery Puschell', description: 'Systems-engineering reference for designing and analyzing space missions.' },
      { title: 'Fundamentals of Astrodynamics and Applications', author: 'David A. Vallado', description: 'Technical reference for spacecraft orbits, navigation and mission analysis.' }
    ],
    advanced: [
      { title: 'Spacecraft Systems Engineering', author: 'Peter Fortescue, Graham Swinerd & John Stark', description: 'Advanced systems-engineering treatment of spacecraft design.' },
      { title: 'Planetary Sciences', author: 'Imke de Pater & Jack J. Lissauer', description: 'Advanced academic reference for planetary science and solar-system physics.' }
    ]
  },
  industry: {
    beginner: [
      { title: 'Automation, Production Systems, and Computer-Integrated Manufacturing', author: 'Mikell P. Groover', description: 'Core academic reference for manufacturing systems and industrial automation.' },
      { title: 'Operations Management', author: 'Jay Heizer, Barry Render & Chuck Munson', description: 'University-level foundation in operations and production management.' }
    ],
    intermediate: [
      { title: 'Factory Physics', author: 'Wallace J. Hopp & Mark L. Spearman', description: 'Analytical framework for production systems and manufacturing performance.' },
      { title: 'Statistical Quality Control', author: 'Douglas C. Montgomery', description: 'Academic treatment of statistical process control and quality engineering.' }
    ],
    advanced: [
      { title: 'Operations Research: An Introduction', author: 'Hamdy A. Taha', description: 'Advanced quantitative foundation for optimization and industrial decision-making.' },
      { title: 'Product Design and Development', author: 'Karl T. Ulrich & Steven D. Eppinger', description: 'University-level framework for systematic product development.' }
    ]
  },
  languages: {
    beginner: [
      { title: 'How Languages are Learned', author: 'Patsy M. Lightbown & Nina Spada', description: 'Research-based foundation for second-language learning and teaching.' },
      { title: 'The Cambridge Guide to Teaching English to Speakers of Other Languages', author: 'Ronald Carter & David Nunan', description: 'Academic reference for language learning and pedagogy.' }
    ],
    intermediate: [
      { title: 'A Practical English Grammar', author: 'A. J. Thomson & A. V. Martinet', description: 'Structured reference for English grammar and usage.' },
      { title: 'The Cambridge Encyclopedia of Language', author: 'David Crystal', description: 'Broad academic reference on language structure, variation and history.' }
    ],
    advanced: [
      { title: 'Second Language Acquisition', author: 'Rod Ellis', description: 'Advanced academic treatment of how additional languages are acquired.' },
      { title: 'Introducing Linguistics', author: 'David Crystal', description: 'Academic introduction to phonetics, grammar, semantics and sociolinguistics.' }
    ]
  },
  education: {
    beginner: [
      { title: 'How People Learn II', author: 'National Academies of Sciences, Engineering, and Medicine', description: 'Evidence-based synthesis of learning, development, context and culture.' },
      { title: 'Educational Psychology', author: 'Anita Woolfolk', description: 'University-level foundation in learning, motivation and classroom practice.' }
    ],
    intermediate: [
      { title: 'Visible Learning', author: 'John Hattie', description: 'Large-scale synthesis of evidence about factors associated with learning outcomes.' },
      { title: 'Make It Stick', author: 'Peter C. Brown, Henry L. Roediger III & Mark A. McDaniel', description: 'Research-informed treatment of retrieval, practice and durable learning.' }
    ],
    advanced: [
      { title: 'The Cambridge Handbook of the Learning Sciences', author: 'R. Keith Sawyer (Washington University in St. Louis)', description: 'Advanced interdisciplinary reference on learning science and instructional design.' },
      { title: 'Design for How People Learn', author: 'Julie Dirksen', description: 'Evidence-informed approach to designing instruction and practice.' }
    ]
  }
};

function familyFor(categoryId: string, subfieldId: string, title: string): AcademicPack {
  const text = `${categoryId} ${subfieldId} ${title}`.toLowerCase();
  if (/(artificial intelligence|\bai\b|machine learning|deep learning|robot|computer vision|nlp|neural)/i.test(text)) return PACKS.ai;
  if (/(econom|macroeconom|microeconom|development|finance|bank|investment|accounting|tax)/i.test(text)) return text.includes('finance') || /(bank|investment|accounting|tax)/i.test(text) ? PACKS.finance : PACKS.economics;
  if (/(psycholog|behavior|cognitive|neuroscience|learning science)/i.test(text)) return PACKS.psychology;
  if (/(politic|govern|international relations|diplomacy|public policy)/i.test(text)) return PACKS.politics;
  if (/(philosoph|ethic)/i.test(text)) return PACKS.philosophy;
  if (/(physics|chemistry|biology|biolog|astronomy|geology|ecology|science)/i.test(text)) return PACKS.science;
  if (/(space|satellite|astrophys|planetary|aerospace)/i.test(text)) return PACKS.space;
  if (/(industry|industrial|manufactur|production|quality|materials|automation|operations)/i.test(text)) return PACKS.industry;
  if (/(language|english|armenian|russian|spanish|french|german|chinese|linguistic)/i.test(text)) return PACKS.languages;
  if (/(education|pedagog|teaching|curriculum|school)/i.test(text)) return PACKS.education;
  if (/(business|entrepreneur|startup|marketing|sales|management|strategy|hr)/i.test(text)) return PACKS.business;
  if (/(engineering|mechanic|electrical|civil|robotics|control|transport|aviation)/i.test(text)) return PACKS.engineering;
  return PACKS.tech;
}

export function getAcademicLiterature(categoryId: string, subfieldId: string, title: string): AcademicPack {
  return familyFor(categoryId, subfieldId, title);
}

export function mergeAcademicLiterature(
  categoryId: string,
  subfieldId: string,
  title: string,
  existing: Partial<AcademicPack> | undefined
): AcademicPack {
  const academic = getAcademicLiterature(categoryId, subfieldId, title);
  const merge = (level: keyof AcademicPack) => {
    const seen = new Set<string>();
    return [...academic[level], ...(existing?.[level] || [])].filter(book => {
      const key = `${book.title}::${book.author}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  };
  return {
    beginner: merge('beginner'),
    intermediate: merge('intermediate'),
    advanced: merge('advanced')
  };
}
