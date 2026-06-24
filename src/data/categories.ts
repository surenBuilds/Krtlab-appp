import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'finance',
    title: 'Ֆինանսներ և Տնտեսագիտություն',
    icon: 'Wallet',
    subfields: [
      { 
        id: 'personal-finance', 
        title: 'Անձնական ֆինանսներ', 
        levels: [],
        courseTopics: [
          "Ինչ է անձնական ֆինանսները",
          "Բյուջետավորման հիմունքներ",
          "Խնայողությունների ռազմավարություն",
          "Պարտքի կառավարում",
          "Վարկային պատմություն և սքորինգ",
          "Ներդրումների ներածություն",
          "Հարկային պլանավորում",
          "Կենսաթոշակային խնայողություններ",
          "Ապահովագրություն և ռիսկեր",
          "Ֆինանսական ազատության հասնելու ուղին"
        ],
        recommendedLiterature: {
          beginner: [
            { title: "Personal Finance", author: "Jeff Madura", description: "University-level textbook on personal finance." },
            { title: "The Economist Guide", author: "The Economist", description: "Practical guide to financial planning and economic principles." }
          ],
          intermediate: [
            { title: "Oxford Handbook of Finance", author: "Oxford University Press", description: "Comprehensive academic reference on financial systems." },
            { title: "Harvard Business School Case Studies", author: "Harvard Business School", description: "Real-world analysis of financial decision-making." }
          ],
          advanced: [{ title: "The Intelligent Investor", author: "Benjamin Graham", description: "The definitive book on value investing and fundamental analysis." }]
        }
      },
      { 
        id: 'investments', 
        title: 'Ներդրումներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "The Intelligent Investor", author: "Benjamin Graham", description: "Classic best-seller on investment strategy." },
            { title: "A Random Walk Down Wall Street", author: "Burton Malkiel", description: "Introduction to the efficient market hypothesis and index investing." }
          ],
          intermediate: [
            { title: "Principles of Corporate Finance", author: "Richard Brealey, Stewart Myers", description: "Standard academic reference in finance courses." },
            { title: "Common Stocks and Uncommon Profits", author: "Philip Fisher", description: "Focuses on qualitative analysis and growth investing strategies." }
          ],
          advanced: [{ title: "Security Analysis", author: "Graham and Dodd", description: "The comprehensive academic foundation for fundamental security valuation." }]
        }
      },
      { 
        id: 'banking', 
        title: 'Բանկային համակարգ', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Banking & Financial Institutions", author: "Anthony Saunders", description: "Textbook used in top universities for banking studies." },
            { title: "The Lords of Easy Money", author: "Christopher Leonard", description: "Explores the impact of central bank policies on the modern economy." }
          ],
          intermediate: [{ title: "The House of Morgan", author: "Ron Chernow", description: "A historical account of the rise of modern banking and financial power." }],
          advanced: [{ title: "Lombard Street", author: "Walter Bagehot", description: "The classic academic description of the money market and central banking." }]
        }
      },
      { 
        id: 'financial-thinking', 
        title: 'Ֆինանսական մտածողություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Psychology of Money", author: "Morgan Housel", description: "Examines the behavioral and emotional aspects of financial decision-making." }],
          intermediate: [{ title: "Misbehaving", author: "Richard Thaler", description: "The birth of behavioral economics and the challenge to traditional models." }],
          advanced: [{ title: "Thinking, Fast and Slow", author: "Daniel Kahneman", description: "Nobel-winning research on cognitive biases and dual-process theory." }]
        }
      },
      { 
        id: 'corporate-finance', 
        title: 'Կորպորատիվ ֆինանսներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Corporate Finance", author: "Jonathan Berk & Peter DeMarzo", description: "Academic textbook covering corporate financial theory and practice." },
            { title: "Corporate Finance for Dummies", author: "Michael Taillard", description: "A simplified introduction to corporate financial management." }
          ],
          intermediate: [{ title: "Applied Corporate Finance", author: "Aswath Damodaran", description: "Practical application of corporate finance theory to real-world valuation." }],
          advanced: [{ title: "Principles of Corporate Finance", author: "Brealey, Myers, and Allen", description: "The standard university textbook for corporate financial theory." }]
        }
      },
      { 
        id: 'crypto-blockchain', 
        title: 'Կրիպտոարժույթներ և Բլոկչեյն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Blockchain Basics", author: "Daniel Drescher", description: "Foundational understanding of blockchain technology." },
            { title: "The Bitcoin Standard", author: "Saifedean Ammous", description: "The economic properties of Bitcoin as a potential global reserve asset." }
          ],
          intermediate: [
            { title: "Mastering Bitcoin", author: "Andreas M. Antonopoulos", description: "Technical guide and reference on Bitcoin." },
            { title: "Mastering Bitcoin", author: "Andreas Antonopoulos", description: "The technical foundation of blockchain technology and cryptography." }
          ],
          advanced: [{ title: "Blockchain and the Law", author: "De Filippi and Wright", description: "Academic analysis of the legal and regulatory challenges of decentralization." }]
        }
      },
      { 
        id: 'economics', 
        title: 'Տնտեսագիտություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Principles of Economics", author: "N. Gregory Mankiw", description: "Widely used introductory economics textbook." },
            { title: "Economics in One Lesson", author: "Henry Hazlitt", description: "A concise introduction to classical economic principles." }
          ],
          intermediate: [{ title: "Basic Economics", author: "Thomas Sowell", description: "A comprehensive, jargon-free guide to economic systems." }],
          advanced: [{ title: "The Wealth of Nations", author: "Adam Smith", description: "The foundational text of modern economic thought and market theory." }]
        }
      },
    ],
  },
  {
    id: 'business',
    title: 'Բիզնես',
    icon: 'Briefcase',
    subfields: [
      { 
        id: 'entrepreneurship', 
        title: 'Ձեռնարկատիրություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "The Lean Startup", author: "Eric Ries", description: "Guide to modern entrepreneurial methods and innovation." },
            { title: "Oxford Handbook of Entrepreneurship", author: "Oxford University Press", description: "Comprehensive academic perspective on entrepreneurship theory." }
          ],
          intermediate: [
            { title: "Innovation and Entrepreneurship", author: "Peter Drucker", description: "Classic work on entrepreneurial principles." },
            { title: "Start-up Nation", author: "Dan Senor & Saul Singer", description: "The story of Israel's economic miracle and startup culture." }
          ],
          advanced: [
            { title: "Entrepreneurship: Theory, Process, Practice", author: "Donald Kuratko", description: "Comprehensive academic perspective on entrepreneurship." },
            { title: "The Innovator's Dilemma", author: "Clayton Christensen", description: "The classic academic work on disruptive innovation and market leadership." }
          ]
        }
      },
      { 
        id: 'marketing', 
        title: 'Մարքեթինգ', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Principles of Marketing", author: "Philip Kotler", description: "Fundamental concepts in modern marketing." },
            { title: "Cambridge Marketing Principles", author: "Cambridge University Press", description: "Academic foundation for marketing theory and practice." }
          ],
          intermediate: [
            { title: "Marketing Management", author: "Philip Kotler & Kevin Keller", description: "Authoritative textbook used in top universities." },
            { title: "Harvard Business Review on Marketing", author: "Harvard Business Review", description: "Collection of influential articles on marketing strategy." }
          ],
          advanced: [{ title: "Marketing Models", author: "Lilien, Kotler, and Moorthy", description: "Academic analysis of quantitative models and decision-making in marketing." }]
        }
      },
      { 
        id: 'sales', 
        title: 'Վաճառքներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "SPIN Selling", author: "Neil Rackham", description: "Classic guide to professional sales techniques." },
            { title: "How to Win Friends and Influence People", author: "Dale Carnegie", description: "Foundational interpersonal skills for professional success." }
          ],
          intermediate: [
            { title: "Sales Management: Analysis and Decision Making", author: "Ingram, LaForge, Schwepker", description: "University-level sales strategy and management." },
            { title: "Solution Selling", author: "Michael Bosworth", description: "A methodology for selling complex products and services." }
          ],
          advanced: [{ title: "The Challenger Sale", author: "Matthew Dixon", description: "Academic analysis of high-performing sales behaviors in modern B2B." }]
        }
      },
      { 
        id: 'startups', 
        title: 'Ստարտափներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Zero to One", author: "Peter Thiel", description: "How to build innovative startups." },
            { title: "The Startup Owner's Manual", author: "Steve Blank & Bob Dorf", description: "Step-by-step guide for building scalable startups." }
          ],
          intermediate: [
            { title: "The Hard Thing About Hard Things", author: "Ben Horowitz", description: "Practical advice on managing a startup through difficult times." },
            { title: "Blitzscaling", author: "Reid Hoffman", description: "Strategies for rapid growth and scaling in high-uncertainty environments." }
          ],
          advanced: [{ title: "The Business of Venture Capital", author: "Mahendra Ramsinghani", description: "Academic perspective on the venture capital industry and startup ecosystem." }]
        }
      },
      { 
        id: 'hr-management', 
        title: 'Մարդկային ռեսուրսների կառավարում', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Human Resource Management", author: "Gary Dessler", description: "Widely used textbook in HR courses." },
            { title: "HR from Harvard Business School Press", author: "Harvard Business School", description: "Strategic insights into human capital management." }
          ],
          intermediate: [
            { title: "The HR Scorecard", author: "Brian Becker", description: "Metrics and performance management in HR." },
            { title: "Human Resource Management: Strategy and Practice", author: "Nankervis, Baird, Coffey", description: "University-level text on strategic HR." }
          ],
          advanced: [{ title: "Strategic Human Resource Management", author: "Jeffrey Mello", description: "Academic analysis of HR as a strategic business partner." }]
        }
      },
      { 
        id: 'strategic-management', 
        title: 'Ռազմավարական կառավարում', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Competitive Strategy", author: "Michael E. Porter", description: "Foundational work on business strategy." },
            { title: "Blue Ocean Strategy", author: "W. Chan Kim and Renée Mauborgne", description: "Best-selling guide to creating uncontested market space." }
          ],
          intermediate: [
            { title: "Strategic Management: Concepts", author: "Fred R. David", description: "Comprehensive academic text for strategic management." },
            { title: "Good to Great", author: "Jim Collins", description: "A study of how companies transition from mediocrity to excellence." }
          ],
          advanced: [{ title: "The Strategy Process", author: "Mintzberg, Quinn, and Ghoshal", description: "The definitive academic collection on strategic thought and practice." }]
        }
      },
      { 
        id: 'small-business-management', 
        title: 'Փոքր բիզնեսի կառավարում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The E-Myth Revisited", author: "Michael Gerber", description: "Why most small businesses don't work and what to do about it." }],
          intermediate: [{ title: "Small Business Management", author: "Justin Longenecker", description: "Comprehensive academic guide to starting and growing small enterprises." }],
          advanced: [{ title: "Traction", author: "Gino Wickman", description: "A systematic operating system for managing and scaling small businesses." }]
        }
      },
      { 
        id: 'business-ethics', 
        title: 'Բիզնես էթիկա', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Business Ethics: Concepts and Cases", author: "Manuel Velasquez", description: "Foundational academic text on ethical theories in business contexts." }],
          intermediate: [{ title: "The Power of Ethical Management", author: "Blanchard and Peale", description: "Practical strategies for maintaining integrity in leadership." }],
          advanced: [{ title: "Ethics and the Conduct of Business", author: "John Boatright", description: "Advanced academic analysis of ethical issues in corporate governance." }]
        }
      },
    ],
  },
  {
    id: 'tech',
    title: 'Տեխնոլոգիա',
    icon: 'Cpu',
    subfields: [
      { 
        id: 'python', 
        title: 'Python ծրագրավորում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Python Crash Course", author: "Eric Matthes", description: "A hands-on, project-based introduction to programming with Python." }],
          intermediate: [{ title: "Oxford Guide to Programming", author: "Oxford University Press", description: "Academic principles of software construction and logic." }],
          advanced: [{ title: "Fluent Python", author: "Luciano Ramalho", description: "Deep dive into Python's best features and idiomatic coding." }]
        }
      },
      { 
        id: 'javascript', 
        title: 'JavaScript ծրագրավորում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Eloquent JavaScript", author: "Marijn Haverbeke", description: "A modern introduction to programming using JavaScript." }],
          intermediate: [{ title: "You Don't Know JS", author: "Kyle Simpson", description: "Deep dive into the core mechanics of the JavaScript language." }],
          advanced: [{ title: "JavaScript: The Good Parts", author: "Douglas Crockford", description: "Academic analysis of the elegant parts of JavaScript's design." }]
        }
      },
      { 
        id: 'web-development', 
        title: 'Վեբ ծրագրավորում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Harvard CS50 Lecture Notes", author: "Harvard University", description: "Foundational concepts of computer science and web programming." }],
          intermediate: [{ title: "Don't Make Me Think", author: "Steve Krug", description: "The classic academic work on web usability and intuitive design." }],
          advanced: [{ title: "High Performance Browser Networking", author: "Ilya Grigorik", description: "Advanced analysis of web performance and networking protocols." }]
        }
      },
      { 
        id: 'mobile-app-development', 
        title: 'Մոբայլ հավելվածների մշակում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Android Programming: The Big Nerd Ranch Guide", author: "Bill Phillips", description: "Practical introduction to mobile app development for Android." }],
          intermediate: [{ title: "iOS Programming: The Big Nerd Ranch Guide", author: "Christian Keur", description: "Comprehensive guide to building professional iOS applications." }],
          advanced: [{ title: "Clean Architecture", author: "Robert C. Martin", description: "Academic principles of software structure and design patterns." }]
        }
      },
      { 
        id: 'ai', 
        title: 'Արհեստական բանականություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Artificial Intelligence: A Modern Approach", author: "Russell and Norvig", description: "The standard academic textbook for AI theory and applications." }],
          intermediate: [{ title: "MIT/Harvard Online Courses on AI", author: "MIT/Harvard", description: "Advanced curriculum on machine learning and neural networks." }],
          advanced: [{ title: "Deep Learning", author: "Ian Goodfellow", description: "The definitive academic text on neural networks and deep learning theory." }]
        }
      },
      { 
        id: 'cybersecurity', 
        title: 'Կիբեռանվտանգություն և տվյալների պաշտպանություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Cybersecurity and Cyberwar", author: "P.W. Singer", description: "What everyone needs to know about the future of security." },
            { title: "OWASP Guidelines", author: "OWASP Foundation", description: "Standard for web application security and data protection." }
          ],
          intermediate: [{ title: "Hacking: The Art of Exploitation", author: "Jon Erickson", description: "Technical foundation of security vulnerabilities and exploitation." }],
          advanced: [{ title: "Applied Cryptography", author: "Bruce Schneier", description: "The comprehensive academic text on cryptographic protocols and systems." }]
        }
      },
      { 
        id: 'data-analysis', 
        title: 'Տվյալների վերլուծություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Storytelling with Data", author: "Cole Nussbaumer Knaflic", description: "Foundational principles of data visualization and communication." }],
          intermediate: [{ title: "Python for Data Analysis", author: "Wes McKinney", description: "Practical guide to data manipulation using the Pandas library." }],
          advanced: [{ title: "The Elements of Statistical Learning", author: "Hastie, Tibshirani, and Friedman", description: "Advanced academic foundation for data mining and prediction." }]
        }
      },
      { 
        id: 'cloud-computing', 
        title: 'Ամպային տեխնոլոգիաներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Cloud Computing Explained", author: "John Rhoton", description: "Introduction to the business and technical aspects of cloud services." }],
          intermediate: [{ title: "Architecting the Cloud", author: "Michael Kavis", description: "Design patterns and strategies for building scalable cloud systems." }],
          advanced: [{ title: "Cloud Native Patterns", author: "Cornelia Davis", description: "Advanced academic analysis of cloud-native software architecture." }]
        }
      },
      { 
        id: 'robotics', 
        title: 'Ռոբոտաշինություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Robot Mechanisms and Mechanical Devices Illustrated", author: "Paul Sandin", description: "Visual guide to the mechanical components of robotic systems." }],
          intermediate: [{ title: "Introduction to Robotics: Mechanics and Control", author: "John Craig", description: "The standard academic text for robotic kinematics and control." }],
          advanced: [{ title: "Probabilistic Robotics", author: "Thrun, Burgard, and Fox", description: "Advanced research on uncertainty and perception in robotic systems." }]
        }
      },
      { 
        id: 'media-tech', 
        title: 'Մեդիա տեխնոլոգիաներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Media Student's Book", author: "Gill Branston", description: "Foundational academic text for media studies and analysis." }],
          intermediate: [{ title: "Digital Media Ethics", author: "Charles Ess", description: "Exploration of ethical challenges in the digital media landscape." }],
          advanced: [{ title: "The Language of New Media", author: "Lev Manovich", description: "Academic analysis of the aesthetic and technical logic of digital media." }]
        }
      },
    ],
  },
  {
    id: 'math',
    title: 'Մաթեմատիկա',
    icon: 'FlaskConical',
    subfields: [
      { 
        id: 'arithmetic', 
        title: 'Թվաբանություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Mathematics Series", author: "Oxford University Press", description: "Foundational concepts in arithmetic and number theory." },
            { title: "The Number Devil", author: "Hans Magnus Enzensberger", description: "A playful introduction to mathematical concepts through storytelling." }
          ],
          intermediate: [{ title: "Arithmetic", author: "Paul Lockhart", description: "Explores the beauty and history of arithmetic beyond mere calculation." }],
          advanced: [{ title: "The Higher Arithmetic", author: "H. Davenport", description: "The classic academic introduction to the theory of numbers." }]
        }
      },
      { 
        id: 'algebra', 
        title: 'Հանրահաշիվ', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Elementary Algebra", author: "Harold R. Jacobs", description: "A clear and engaging introduction to algebraic concepts." },
            { title: "Cambridge Mathematics Texts", author: "Cambridge University Press", description: "Rigorous academic foundation for algebraic theory." }
          ],
          intermediate: [{ title: "Algebra", author: "Michael Artin", description: "The standard undergraduate textbook for abstract algebra." }],
          advanced: [{ title: "Linear Algebra Done Right", author: "Sheldon Axler", description: "Advanced academic treatment of linear algebra and vector spaces." }]
        }
      },
      { 
        id: 'geometry', 
        title: 'Երկրաչափություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Geometry", author: "Jurgensen, Brown, Jurgensen", description: "Classic textbook for Euclidean geometry." },
            { title: "Euclid's Elements", author: "Euclid", description: "The foundational text of geometry and mathematical proof." }
          ],
          intermediate: [{ title: "Geometry: A Comprehensive Course", author: "Dan Pedoe", description: "A thorough academic treatment of Euclidean and projective geometry." }],
          advanced: [{ title: "Riemannian Geometry", author: "Manfredo do Carmo", description: "Advanced academic study of curved spaces and differential geometry." }]
        }
      },
      { 
        id: 'trigonometry', 
        title: 'Եռանկյունաչափություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Trigonometry", author: "I.M. Gelfand", description: "A clear and rigorous introduction to trigonometric functions." }],
          intermediate: [{ title: "Trigonometry", author: "S.L. Loney", description: "The classic academic text for plane trigonometry." }],
          advanced: [{ title: "Plane Trigonometry", author: "Todhunter", description: "Advanced historical treatment of trigonometric theory and application." }]
        }
      },
      { 
        id: 'calculus', 
        title: 'Մաթեմատիկական անալիզ', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Calculus: Early Transcendentals", author: "James Stewart", description: "Widely used academic textbook for calculus." },
            { title: "Principles of Mathematical Analysis", author: "Walter Rudin", description: "The definitive academic text for real analysis and advanced calculus." }
          ],
          intermediate: [{ title: "Calculus", author: "Michael Spivak", description: "A rigorous, proof-based introduction to single-variable calculus." }],
          advanced: [{ title: "Harvard Statistical Learning", author: "Harvard University", description: "Advanced mathematical analysis for data science and prediction." }]
        }
      },
      { 
        id: 'statistics', 
        title: 'Վիճակագրություն և հավանականություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Probability and Statistics for Engineering and the Sciences", author: "Jay Devore", description: "Comprehensive guide to statistical methods in science." },
            { title: "Applied Probability (Harvard)", author: "Harvard University Press", description: "Foundational principles of probability theory and its applications." }
          ],
          intermediate: [{ title: "The Lady Tasting Tea", author: "David Salsburg", description: "A historical account of the development of modern statistics." }],
          advanced: [{ title: "Probability Theory: The Logic of Science", author: "E.T. Jaynes", description: "Advanced academic treatment of Bayesian probability theory." }]
        }
      },
    ],
  },
  {
    id: 'natural-sciences',
    title: 'Բնական գիտություններ',
    icon: 'FlaskConical',
    subfields: [
      { 
        id: 'mechanics', 
        title: 'Ֆիզիկա: Մեխանիկա', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Science Library", author: "Oxford University Press", description: "Foundational concepts in physical and biological sciences." },
            { title: "Cambridge Science Textbooks", author: "Cambridge University Press", description: "Rigorous academic introduction to scientific principles." }
          ],
          intermediate: [{ title: "Physics for Scientists & Engineers", author: "Serway and Jewett", description: "The standard academic textbook for physics and engineering." }],
          advanced: [{ title: "Harvard University Science Notes", author: "Harvard University", description: "Advanced research and theoretical developments in modern science." }]
        }
      },
      { 
        id: 'electricity', 
        title: 'Ֆիզիկա: Էլեկտրականություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Feynman Lectures on Physics, Vol. 2", author: "Richard Feynman", description: "Comprehensive introduction to electromagnetism and matter." }],
          intermediate: [{ title: "Introduction to Electrodynamics", author: "David Griffiths", description: "The most widely used undergraduate text for electromagnetic theory." }],
          advanced: [{ title: "Classical Electrodynamics", author: "John David Jackson", description: "The definitive academic text for advanced electromagnetism." }]
        }
      },
      { 
        id: 'optics', 
        title: 'Ֆիզիկա: Օպտիկա', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Optics", author: "Eugene Hecht", description: "The standard undergraduate textbook for classical and modern optics." }],
          intermediate: [{ title: "Principles of Optics", author: "Born and Wolf", description: "The comprehensive academic foundation for electromagnetic theory of light." }],
          advanced: [{ title: "Introduction to Fourier Optics", author: "Joseph Goodman", description: "Advanced academic study of diffraction and optical systems." }]
        }
      },
      { 
        id: 'molecular-physics', 
        title: 'Ֆիզիկա: Մոլեկուլային ֆիզիկա', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Thermal Physics", author: "Kittel and Kroemer", description: "Introduction to thermodynamics and statistical mechanics." }],
          intermediate: [{ title: "Statistical Mechanics", author: "Pathria", description: "The standard graduate-level text for statistical physical theory." }],
          advanced: [{ title: "Statistical Physics", author: "Landau and Lifshitz", description: "Advanced theoretical treatment of statistical mechanics and matter." }]
        }
      },
      { 
        id: 'organic-chemistry', 
        title: 'Քիմիա: Օրգանական', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Organic Chemistry (Harvard Edition)", author: "Harvard University Press", description: "Comprehensive introduction to organic chemical structures." },
            { title: "The Disappearing Spoon", author: "Sam Kean", description: "A lively and accessible account of the history and science of the periodic table." }
          ],
          intermediate: [{ title: "Principles of Chemistry", author: "Joel Hildebrand", description: "A comprehensive and detailed account of the principles of chemistry." }],
          advanced: [{ title: "Advanced Organic Chemistry", author: "Carey and Sundberg", description: "Advanced academic study of the principles and practice of organic chemistry." }]
        }
      },
      { 
        id: 'inorganic-chemistry', 
        title: 'Քիմիա: Անօրգանական', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Inorganic Chemistry", author: "Miessler and Tarr", description: "Introduction to the structure and properties of inorganic compounds." }],
          intermediate: [{ title: "Inorganic Chemistry", author: "Shriver and Atkins", description: "The standard undergraduate text for inorganic chemical theory." }],
          advanced: [{ title: "Advanced Inorganic Chemistry", author: "Cotton and Wilkinson", description: "The comprehensive academic reference for inorganic chemistry." }]
        }
      },
      { 
        id: 'physical-chemistry', 
        title: 'Քիմիա: Ֆիզիկական', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Physical Chemistry", author: "Peter Atkins", description: "The world's most widely used textbook for physical chemistry." }],
          intermediate: [{ title: "Physical Chemistry", author: "McQuarrie and Simon", description: "A rigorous, molecular-level approach to physical chemical theory." }],
          advanced: [{ title: "Statistical Mechanics", author: "Donald McQuarrie", description: "Advanced academic study of the statistical basis of thermodynamics." }]
        }
      },
      { 
        id: 'molecular-biology', 
        title: 'Կենսաբանություն: Մոլեկուլային', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Molecular Biology of the Cell", author: "Bruce Alberts", description: "The definitive academic textbook for cell biology and molecular mechanisms." },
            { title: "The Selfish Gene", author: "Richard Dawkins", description: "A classic and influential account of the principles of evolutionary biology." }
          ],
          intermediate: [{ title: "Principles of Ecology", author: "Oxford University Press", description: "Academic foundation for ecological systems and environmental science." }],
          advanced: [{ title: "Genes", author: "Benjamin Lewin", description: "Advanced academic treatment of gene structure and expression." }]
        }
      },
      { 
        id: 'anatomy', 
        title: 'Կենսաբանություն: Անատոմիա', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Human Anatomy by Oxford", author: "Oxford University Press", description: "Comprehensive guide to human biological structures and systems." },
            { title: "Gray's Anatomy for Students", author: "Drake et al.", description: "A student-friendly introduction to human anatomy with clinical relevance." }
          ],
          intermediate: [{ title: "Netter's Atlas of Human Anatomy", author: "Frank Netter", description: "The world's most famous anatomical atlas for visual learning." }],
          advanced: [{ title: "Clinically Oriented Anatomy", author: "Keith Moore", description: "Advanced academic text focusing on the clinical application of anatomy." }]
        }
      },
      { 
        id: 'histology', 
        title: 'Կենսաբանություն: Հիստոլոգիա', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Junqueira's Basic Histology", author: "Anthony Mescher", description: "Introduction to the microscopic structure of human tissues." }],
          intermediate: [{ title: "Wheater's Functional Histology", author: "Young et al.", description: "A visual guide to histology with emphasis on functional relevance." }],
          advanced: [{ title: "Histology: A Text and Atlas", author: "Ross and Pawlina", description: "Advanced academic reference combining histology theory and high-quality imagery." }]
        }
      },
      { 
        id: 'ecology', 
        title: 'Էկոլոգիա', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Selfish Gene", author: "Richard Dawkins", description: "A revolutionary look at evolution from the perspective of the gene." }],
          intermediate: [{ title: "Ecology: From Individuals to Ecosystems", author: "Begon et al.", description: "The comprehensive academic text for modern ecological theory." }],
          advanced: [{ title: "The Diversity of Life", author: "E.O. Wilson", description: "Advanced academic study of biodiversity and the history of life on Earth." }]
        }
      },
      { 
        id: 'physical-geography', 
        title: 'Աշխարհագրություն: Ֆիզիկական', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Physical Geography: A Landscape Appreciation", author: "McKnight", description: "Introduction to the physical systems and landscapes of the Earth." }],
          intermediate: [{ title: "Fundamentals of Physical Geography", author: "Petersen", description: "Comprehensive guide to the processes that shape the Earth's surface." }],
          advanced: [{ title: "Geomorphology: The Mechanics and Chemistry of Landscapes", author: "Anderson", description: "Advanced academic study of the physical and chemical processes of landform evolution." }]
        }
      },
      { 
        id: 'regional-geography', 
        title: 'Աշխարհագրություն: Տարածաշրջանային', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Prisoners of Geography", author: "Tim Marshall", description: "Explores how geography shapes the destiny of nations and global politics." }],
          intermediate: [{ title: "The Revenge of Geography", author: "Robert Kaplan", description: "Historical and strategic analysis of the impact of geography on conflict." }],
          advanced: [{ title: "Regional Geography of the World", author: "Wheeler", description: "Advanced academic study of the world's regions and their unique characteristics." }]
        }
      },
      { 
        id: 'cities-countries', 
        title: 'Աշխարհագրություն: Քաղաքներ և երկրներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Silk Roads", author: "Peter Frankopan", description: "A major reassessment of world history through the lens of the East." }],
          intermediate: [{ title: "Why Nations Fail", author: "Acemoglu and Robinson", description: "Academic analysis of the origins of power, prosperity, and poverty." }],
          advanced: [{ title: "Guns, Germs, and Steel", author: "Jared Diamond", description: "Advanced academic study of the environmental factors that shaped human history." }]
        }
      },
    ],
  },
  {
    id: 'humanities',
    title: 'Հումանիտար գիտություններ',
    icon: 'BookOpen',
    subfields: [
      { 
        id: 'armenian-history', 
        title: 'Հայոց պատմություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "A History of Armenia", author: "Vahan M. Kurkjian", description: "A comprehensive historical account of Armenia from ancient times." },
            { title: "History of Armenia", author: "Simon Payaslian", description: "A concise introduction to the history of Armenia from ancient times to the present." }
          ],
          intermediate: [{ title: "The Armenians: A Past and a Future", author: "Christopher J. Walker", description: "A detailed account of the Armenian people's history and their struggle for survival." }],
          advanced: [{ title: "A History of the Armenian People", author: "George Bournoutian", description: "Advanced academic study of the Armenian people's history and culture." }]
        }
      },
      { 
        id: 'world-history', 
        title: 'Համաշխարհային պատմություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford History of the World", author: "Oxford University Press", description: "Comprehensive academic account of global historical developments." },
            { title: "A Little History of the World", author: "E.H. Gombrich", description: "A charming and accessible introduction to the history of humanity." }
          ],
          intermediate: [{ title: "Cambridge History of Modern Times", author: "Cambridge University Press", description: "Detailed academic analysis of modern historical events." }],
          advanced: [{ title: "The Lessons of History", author: "Will and Ariel Durant", description: "Advanced academic analysis of the patterns and lessons of human history." }]
        }
      },
      { 
        id: 'contemporary-history', 
        title: 'Ժամանակակից պատմություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The World Since 1945", author: "P.M.H. Bell", description: "A concise introduction to the history of the world since the end of WWII." }],
          intermediate: [{ title: "Postwar: A History of Europe Since 1945", author: "Tony Judt", description: "A comprehensive and detailed account of the history of Europe since 1945." }],
          advanced: [{ title: "The Age of Extremes", author: "Eric Hobsbawm", description: "Advanced academic analysis of the history of the 'short twentieth century'." }]
        }
      },
      { 
        id: 'armenian-literature', 
        title: 'Հայ գրականություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Armenian Literature", author: "Kevork Bardakjian", description: "A concise introduction to the history and development of Armenian literature." }],
          intermediate: [{ title: "The Heritage of Armenian Literature", author: "Agop Hacikyan", description: "A comprehensive account of the rich heritage of Armenian literary works." }],
          advanced: [{ title: "Modern Armenian Literature", author: "James Etmekjian", description: "Advanced academic study of modern Armenian literary movements and authors." }]
        }
      },
      { 
        id: 'world-literature', 
        title: 'Համաշխարհային գրականություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Harvard Classics", author: "Harvard University", description: "Anthology of the world's most influential literary works." },
            { title: "Literature: World & Armenian Anthologies", author: "Multiple Authors", description: "Comprehensive collection of global and national literary masterpieces." }
          ],
          intermediate: [{ title: "How to Read Literature Like a Professor", author: "Thomas C. Foster", description: "A lively and accessible guide to the deeper meanings of literary works." }],
          advanced: [{ title: "Mimesis", author: "Erich Auerbach", description: "Advanced academic study of the representation of reality in Western literature." }]
        }
      },
      { 
        id: 'philosophy', 
        title: 'Փիլիսոփայություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Handbook of Philosophy", author: "Oxford University Press", description: "Comprehensive academic reference for philosophical concepts." },
            { title: "Sophie's World", author: "Jostein Gaarder", description: "A charming and engaging introduction to the history of philosophy." }
          ],
          intermediate: [{ title: "Stanford Encyclopedia of Philosophy", author: "Stanford University", description: "Authoritative academic resource for philosophical research." }],
          advanced: [{ title: "Critique of Pure Reason", author: "Immanuel Kant", description: "Advanced academic study of the nature and limits of human knowledge." }]
        }
      },
      { 
        id: 'psychology', 
        title: 'Հոգեբանություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Psychology by Harvard", author: "Harvard University Press", description: "Foundational principles of human behavior and mental processes." },
            { title: "Man's Search for Meaning", author: "Viktor Frankl", description: "A profound and moving account of the search for meaning in the face of suffering." }
          ],
          intermediate: [{ title: "Sociology Texts (Cambridge)", author: "Cambridge University Press", description: "Academic foundation for social structures and group dynamics." }],
          advanced: [{ title: "The Interpretation of Dreams", author: "Sigmund Freud", description: "Advanced academic study of the nature and meaning of dreams." }]
        }
      },
      { 
        id: 'sociology', 
        title: 'Սոցիոլոգիա', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Sociological Imagination", author: "C. Wright Mills", description: "A classic introduction to the sociological perspective and its importance." }],
          intermediate: [{ title: "The Presentation of Self in Everyday Life", author: "Erving Goffman", description: "A detailed account of the ways in which we present ourselves to others." }],
          advanced: [{ title: "Economy and Society", author: "Max Weber", description: "Advanced academic study of the relationship between economy and society." }]
        }
      },
      { 
        id: 'social-studies', 
        title: 'Հասարակագիտություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Social Contract", author: "Jean-Jacques Rousseau", description: "A classic introduction to the principles of political right and the social contract." }],
          intermediate: [{ title: "The Road to Serfdom", author: "Friedrich Hayek", description: "A provocative and influential account of the dangers of central planning." }],
          advanced: [{ title: "The Structure of Social Action", author: "Talcott Parsons", description: "Advanced academic study of the nature and structure of social action." }]
        }
      },
      { 
        id: 'civic-studies', 
        title: 'Քաղաքացիական կրթություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "On Liberty", author: "John Stuart Mill", description: "A classic introduction to the principles of individual liberty and its limits." }],
          intermediate: [{ title: "The Federalist Papers", author: "Hamilton, Madison, and Jay", description: "A detailed account of the principles and structure of the US Constitution." }],
          advanced: [{ title: "A Theory of Justice", author: "John Rawls", description: "Advanced academic study of the principles of justice and fairness." }]
        }
      },
      { 
        id: 'education', 
        title: 'Կրթություն և մանկավարժություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Paideia Proposal", author: "Mortimer Adler", description: "A provocative and influential account of the goals and methods of education." }],
          intermediate: [{ title: "Democracy and Education", author: "John Dewey", description: "A comprehensive and detailed account of the relationship between democracy and education." }],
          advanced: [{ title: "Pedagogy of the Oppressed", author: "Paulo Freire", description: "Advanced academic study of the goals and methods of critical pedagogy." }]
        }
      },
    ],
  },
  {
    id: 'law',
    title: 'Իրավական գիտություններ',
    icon: 'Scale',
    subfields: [
      { 
        id: 'general-law', 
        title: 'Ընդհանուր իրավունք', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Handbook of Law", author: "Oxford University Press", description: "Comprehensive academic reference for legal systems and theory." },
            { title: "The Law", author: "Frédéric Bastiat", description: "A classic defense of individual liberty and the rule of law." }
          ],
          intermediate: [{ title: "Cambridge Law Series", author: "Cambridge University Press", description: "Rigorous academic foundation for various legal disciplines." }],
          advanced: [{ title: "Harvard Law Review", author: "Harvard University", description: "Influential academic journal covering cutting-edge legal research." }]
        }
      },
      { 
        id: 'civil-law', 
        title: 'Քաղաքացիական իրավունք', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Civil Law: Cases and Materials", author: "Mary Ann Glendon", description: "Academic introduction to the civil law tradition." },
            { title: "Introduction to Civil Law", author: "David Johnston", description: "A concise introduction to the principles and institutions of civil law." }
          ],
          intermediate: [{ title: "The Civil Law Tradition", author: "John Henry Merryman", description: "A comprehensive account of the history and development of the civil law tradition." }],
          advanced: [{ title: "Principles of European Contract Law", author: "Lando and Beale", description: "Advanced academic study of the principles of contract law in Europe." }]
        }
      },
      { 
        id: 'criminal-law', 
        title: 'Քրեական իրավունք', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Criminal Law: A Very Short Introduction", author: "Stephen P. Garvey", description: "A concise introduction to the principles and institutions of criminal law." }],
          intermediate: [{ title: "Principles of Criminal Law", author: "Andrew Ashworth", description: "A comprehensive and detailed account of the principles of criminal law." }],
          advanced: [{ title: "The Limits of the Criminal Sanction", author: "Herbert Packer", description: "Advanced academic study of the philosophical foundations of criminal law." }]
        }
      },
      { 
        id: 'business-law', 
        title: 'Բիզնես իրավունք', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Business Law for Dummies", author: "Richard Stim", description: "A simplified introduction to the principles and institutions of business law." }],
          intermediate: [{ title: "Essentials of Business Law", author: "Anthony Liuzzo", description: "A comprehensive and detailed account of the principles of business law." }],
          advanced: [{ title: "The Law of Business Organizations", author: "Robert Hamilton", description: "Advanced academic study of the legal and social foundations of business." }]
        }
      },
      { 
        id: 'economic-law', 
        title: 'Տնտեսական իրավունք', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Law and Economics", author: "Robert Cooter", description: "A concise introduction to the principles and institutions of law and economics." }],
          intermediate: [{ title: "Economic Analysis of Law", author: "Richard Posner", description: "A comprehensive and detailed account of the economic foundations of law." }],
          advanced: [{ title: "The Economic Structure of Corporate Law", author: "Easterbrook and Fischel", description: "Advanced academic study of the economic foundations of corporate law." }]
        }
      },
      { 
        id: 'labor-law', 
        title: 'Աշխատանքային իրավունք', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Labor Law: A Very Short Introduction", author: "Matthew Finkin", description: "A concise introduction to the principles and institutions of labor law." }],
          intermediate: [{ title: "The Law of the Workplace", author: "James Ottavio Jansson", description: "A comprehensive and detailed account of the principles of labor law." }],
          advanced: [{ title: "Employment Law", author: "Mark Rothstein", description: "Advanced academic study of the legal and social foundations of the workplace." }]
        }
      },
      { 
        id: 'administrative-law', 
        title: 'Վարչական իրավունք', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Administrative Law", author: "Jack Beermann", description: "A concise introduction to the principles and institutions of administrative law." }],
          intermediate: [{ title: "Principles of Administrative Law", author: "Anne Mullins", description: "A comprehensive and detailed account of the principles of administrative law." }],
          advanced: [{ title: "Administrative Law and Regulatory Policy", author: "Breyer et al.", description: "Advanced academic study of the legal and social foundations of regulation." }]
        }
      },
      { 
        id: 'international-law', 
        title: 'Միջազգային իրավունք', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Principles of International Law", author: "Oxford University Press", description: "Foundational concepts of global legal frameworks." },
            { title: "International Law: A Very Short Introduction", author: "Vaughan Lowe", description: "A concise introduction to the principles and institutions of international law." }
          ],
          intermediate: [{ title: "Harvard Case Studies on Law", author: "Harvard University", description: "Real-world analysis of international legal disputes." }],
          advanced: [{ title: "The International Law of Human Rights", author: "Paul Sieghart", description: "Advanced academic study of the legal and social foundations of human rights." }]
        }
      },
      { 
        id: 'constitutional-law', 
        title: 'Սահմանադրական իրավունք', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Constitution of Liberty", author: "Friedrich Hayek", description: "A classic defense of individual liberty and the rule of law." }],
          intermediate: [{ title: "Constitutional Law", author: "Erwin Chemerinsky", description: "A comprehensive and detailed account of the principles of constitutional law." }],
          advanced: [{ title: "The Federalist Papers", author: "Hamilton, Madison, and Jay", description: "A detailed account of the principles and structure of the US Constitution." }]
        }
      },
      { 
        id: 'human-rights', 
        title: 'Մարդու իրավունքներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Human Rights: A Very Short Introduction", author: "Andrew Clapham", description: "A concise introduction to the principles and institutions of human rights law." }],
          intermediate: [{ title: "The Evolution of International Human Rights", author: "Paul Gordon Lauren", description: "A comprehensive account of the history and development of human rights." }],
          advanced: [{ title: "International Human Rights Law", author: "Olivier De Schutter", description: "Advanced academic study of the legal and social foundations of human rights." }]
        }
      },
      { 
        id: 'intellectual-property', 
        title: 'Մտավոր սեփականություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Intellectual Property Handbook", author: "Oxford University Press", description: "Comprehensive guide to IP laws and regulations." },
            { title: "Intellectual Property: A Very Short Introduction", author: "Siva Vaidhyanathan", description: "A concise introduction to the principles and institutions of intellectual property law." }
          ],
          intermediate: [{ title: "Principles of Intellectual Property", author: "Stephen Elias", description: "A comprehensive and detailed account of the principles of intellectual property law." }],
          advanced: [{ title: "Intellectual Property in the New Technological Age", author: "Merges et al.", description: "Advanced academic study of the impact of technology on intellectual property." }]
        }
      },
    ],
  },
  {
    id: 'creative-arts',
    title: 'Ստեղծարար արվեստներ',
    icon: 'BookOpen',
    subfields: [
      { 
        id: 'drawing', 
        title: 'Նկարչություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Art Companions", author: "Oxford University Press", description: "Comprehensive reference for art history and techniques." },
            { title: "Drawing on the Right Side of the Brain", author: "Betty Edwards", description: "A revolutionary approach to learning to draw based on brain research." }
          ],
          intermediate: [{ title: "Cambridge Art & Design Texts", author: "Cambridge University Press", description: "Academic foundation for artistic principles and design theory." }],
          advanced: [{ title: "Figure Drawing for All It's Worth", author: "Andrew Loomis", description: "The definitive academic guide to drawing the human figure." }]
        }
      },
      { 
        id: 'design', 
        title: 'Դիզայն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Design of Everyday Things", author: "Don Norman", description: "A classic and influential account of the principles of intuitive design." }],
          intermediate: [{ title: "Thinking with Type", author: "Ellen Lupton", description: "A lively and accessible guide to the principles of typography and design." }],
          advanced: [{ title: "Interaction Design", author: "Preece, Rogers, and Sharp", description: "Advanced academic study of the principles and practice of interaction design." }]
        }
      },
      { 
        id: '3d-modeling', 
        title: '3D մոդելավորում', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Principles of 3D Modeling", author: "Multiple Authors", description: "Foundational concepts of three-dimensional digital construction." },
            { title: "Blender For Dummies", author: "Jason van Gumster", description: "A simplified introduction to the principles and practice of 3D modeling." }
          ],
          intermediate: [{ title: "The Art of 3D Computer Animation and Effects", author: "Isaac Kerlow", description: "A comprehensive and detailed account of the principles of 3D animation." }],
          advanced: [{ title: "Digital Modeling", author: "William Vaughan", description: "Advanced academic study of the principles and practice of digital modeling." }]
        }
      },
      { 
        id: 'music-theory', 
        title: 'Երաժշտություն և երաժշտության տեսություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Harvard Music and Theatre Notes", author: "Harvard University", description: "Academic insights into music theory and performance arts." },
            { title: "Music Theory for Dummies", author: "Michael Pilhofer", description: "A simplified introduction to the principles and practice of music theory." }
          ],
          intermediate: [{ title: "The Rest Is Noise", author: "Alex Ross", description: "A lively and accessible account of the history of twentieth-century music." }],
          advanced: [{ title: "Tonal Harmony", author: "Stefan Kostka", description: "Advanced academic study of the principles and practice of tonal harmony." }]
        }
      },
      { 
        id: 'drama-theater', 
        title: 'Դրամա և թատրոն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Empty Space", author: "Peter Brook", description: "A classic and influential account of the nature and purpose of theater." }],
          intermediate: [{ title: "An Actor Prepares", author: "Constantin Stanislavski", description: "The definitive academic guide to the art of acting and character preparation." }],
          advanced: [{ title: "The Theatre of the Absurd", author: "Martin Esslin", description: "Advanced academic study of the history and development of the theater of the absurd." }]
        }
      },
      { 
        id: 'media-communication', 
        title: 'Մեդիա և հաղորդակցություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Media Studies Handbook (Harvard)", author: "Harvard University Press", description: "Comprehensive academic guide to media theory and communication." },
            { title: "Understanding Media", author: "Marshall McLuhan", description: "A classic and influential account of the impact of media on society." }
          ],
          intermediate: [{ title: "Manufacturing Consent", author: "Herman and Chomsky", description: "A provocative and influential account of the role of media in shaping public opinion." }],
          advanced: [{ title: "The Network Society", author: "Manuel Castells", description: "Advanced academic study of the social and economic impact of the network society." }]
        }
      },
    ],
  },
  {
    id: 'urban-planning',
    title: 'Քաղաքաշինություն',
    icon: 'Building2',
    subfields: [
      { 
        id: 'urban-design', 
        title: 'Քաղաքային դիզայն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Harvard Urban Design Lectures", author: "Harvard University", description: "Academic insights into urban planning and architectural design." },
            { title: "The Death and Life of Great American Cities", author: "Jane Jacobs", description: "The classic academic work on the importance of diversity and vitality in urban life." }
          ],
          intermediate: [{ title: "Oxford Handbook of Architecture", author: "Oxford University Press", description: "Comprehensive academic reference for architectural theory and practice." }],
          advanced: [{ title: "Cambridge Urban Planning", author: "Cambridge University Press", description: "Advanced academic study of urban development and spatial planning." }]
        }
      },
      { 
        id: 'land-use-planning', 
        title: 'Հողօգտագործման պլանավորում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Land Use Planning and Development Regulation Law", author: "Julian Juergensmeyer", description: "A concise introduction to the legal principles of land use planning." }],
          intermediate: [{ title: "Urban Land Use Planning", author: "Philip Berke", description: "A comprehensive and detailed account of the principles of urban land use planning." }],
          advanced: [{ title: "The Geography of Nowhere", author: "James Howard Kunstler", description: "Advanced academic study of the social and environmental impact of urban sprawl." }]
        }
      },
      { 
        id: 'transport-infrastructure', 
        title: 'Տրանսպորտային և ենթակառուցվածքային համակարգեր', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Transport Planning Guides", author: "Multiple Authors", description: "Foundational principles of transportation network design." },
            { title: "Human Transit", author: "Jarrett Walker", description: "A lively and accessible guide to the principles of intuitive public transit design." }
          ],
          intermediate: [{ title: "Transportation Planning Handbook", author: "ITE", description: "A comprehensive and detailed account of the principles of transportation planning." }],
          advanced: [{ title: "The Geography of Transport Systems", author: "Jean-Paul Rodrigue", description: "Advanced academic study of the spatial and economic logic of transport systems." }]
        }
      },
      { 
        id: 'sustainable-architecture', 
        title: 'Կայուն ճարտարապետություն և շրջակա միջավայր', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Sustainable Cities Texts", author: "Multiple Authors", description: "Academic foundation for eco-friendly urban development." },
            { title: "The Upcycle", author: "McDonough and Braungart", description: "A provocative and influential account of the principles of sustainable design." }
          ],
          intermediate: [{ title: "Sustainable Design", author: "Williams", description: "A comprehensive and detailed account of the principles of sustainable architecture." }],
          advanced: [{ title: "Cradle to Cradle", author: "McDonough and Braungart", description: "Advanced academic study of the principles of regenerative design and production." }]
        }
      },
      { 
        id: 'urban-sociology', 
        title: 'Քաղաքային սոցիոլոգիա և հանրային տարածքներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Social Life of Small Urban Spaces", author: "William H. Whyte", description: "A classic and influential account of the ways in which people use urban spaces." }],
          intermediate: [{ title: "Urban Sociology", author: "Flanagan", description: "A comprehensive and detailed account of the principles of urban sociology." }],
          advanced: [{ title: "The City in History", author: "Lewis Mumford", description: "Advanced academic study of the history and development of the city as a social form." }]
        }
      },
    ],
  },
  {
    id: 'aviation',
    title: 'Ավիացիա',
    icon: 'Plane',
    subfields: [
      { 
        id: 'aeronautics-basics', 
        title: 'Աերոնավտիկա և օդային տրանսպորտի հիմունքներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Aviation Manuals", author: "Oxford University Press", description: "Comprehensive guide to aeronautics and flight principles." },
            { title: "Principles of Flight", author: "Multiple Authors", description: "Foundational concepts of aerodynamics and aircraft control." }
          ],
          intermediate: [
            { title: "Cambridge Air Transport Texts", author: "Cambridge University Press", description: "Academic foundation for air transportation systems." },
            { title: "Fundamentals of Aerodynamics", author: "John Anderson", description: "The definitive academic textbook for the principles of aerodynamics." }
          ],
          advanced: [
            { title: "Harvard Aerospace Studies", author: "Harvard University", description: "Advanced research in aerospace engineering and technology." },
            { title: "Aerodynamics for Engineers", author: "Bertin and Smith", description: "Advanced academic study of the principles and practice of aerodynamic design." }
          ]
        }
      },
      { 
        id: 'navigation-atc', 
        title: 'Նավիգացիա և օդային երթևեկության կառավարում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Pilot's Manual: Ground School", author: "Aviation Theory Centre", description: "A comprehensive and detailed account of the principles of flight and navigation." }],
          intermediate: [{ title: "Air Traffic Control", author: "Nolan", description: "A concise introduction to the principles and institutions of air traffic control." }],
          advanced: [{ title: "Global Navigation Satellite Systems", author: "Hofmann-Wellenhof", description: "Advanced academic study of the principles and practice of satellite navigation." }]
        }
      },
      { 
        id: 'aircraft-systems', 
        title: 'Օդանավերի համակարգեր և տեխնոլոգիաներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Aircraft Systems", author: "Ian Moir", description: "A concise introduction to the principles and institutions of aircraft systems." }],
          intermediate: [{ title: "Aircraft Electrical and Electronic Systems", author: "Tooley", description: "A comprehensive and detailed account of the principles of aircraft electronics." }],
          advanced: [{ title: "Design and Development of Aircraft Systems", author: "Moir and Seabridge", description: "Advanced academic study of the principles and practice of aircraft system design." }]
        }
      },
      { 
        id: 'aircraft-maintenance', 
        title: 'Օդանավերի սպասարկում և շահագործում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Aviation Maintenance Technician Handbook", author: "FAA", description: "A comprehensive and detailed account of the principles of aircraft maintenance." }],
          intermediate: [{ title: "Aircraft Maintenance and Repair", author: "Kroes", description: "A concise introduction to the principles and institutions of aircraft repair." }],
          advanced: [{ title: "Reliability-Centered Maintenance", author: "Anthony Smith", description: "Advanced academic study of the principles and practice of reliability-centered maintenance." }]
        }
      },
      { 
        id: 'aviation-safety', 
        title: 'Ավիացիոն անվտանգություն և կանոնակարգեր', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Aviation Safety Management Guides", author: "Multiple Authors", description: "Foundational principles of safety protocols in aviation." },
            { title: "The Naked Pilot", author: "David Beaty", description: "A provocative and influential account of the role of human error in aviation safety." }
          ],
          intermediate: [{ title: "Commercial Aviation Safety", author: "Wells", description: "A comprehensive and detailed account of the principles of commercial aviation safety." }],
          advanced: [{ title: "Safety-I and Safety-II", author: "Erik Hollnagel", description: "Advanced academic study of the principles and practice of safety management." }]
        }
      },
    ],
  },
  {
    id: 'transport',
    title: 'Տրանսպորտ',
    icon: 'Truck',
    subfields: [
      { 
        id: 'road-transport', 
        title: 'Ճանապարհային տրանսպորտ և երթևեկության կառավարում', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Cambridge Transportation Studies", author: "Cambridge University Press", description: "Academic foundation for transportation engineering and policy." },
            { title: "Traffic", author: "Tom Vanderbilt", description: "A lively and accessible account of the ways in which traffic shapes our lives." }
          ],
          intermediate: [{ title: "Traffic Engineering", author: "Roess", description: "A comprehensive and detailed account of the principles of traffic engineering." }],
          advanced: [{ title: "Modeling Transport", author: "Ortúzar and Willumsen", description: "Advanced academic study of the principles and practice of transport modeling." }]
        }
      },
      { 
        id: 'route-logistics', 
        title: 'Երթուղիների և լոգիստիկայի կառավարում', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Logistics Handbook", author: "Oxford University Press", description: "Comprehensive academic reference for logistics and supply chain management." },
            { title: "The Goal", author: "Eliyahu Goldratt", description: "A classic and influential account of the principles of theory of constraints." }
          ],
          intermediate: [{ title: "Logistics and Supply Chain Management", author: "Martin Christopher", description: "A comprehensive and detailed account of the principles of logistics management." }],
          advanced: [
            { title: "Harvard Transport Management Notes", author: "Harvard University", description: "Strategic insights into transportation and logistics management." },
            { title: "Supply Chain Management", author: "Sunil Chopra", description: "Advanced academic study of the principles and practice of supply chain management." }
          ]
        }
      },
      { 
        id: 'warehousing-freight', 
        title: 'Պահեստավորում և բեռնափոխադրումներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Warehouse Management", author: "Gwynne Richards", description: "A concise introduction to the principles and institutions of warehouse management." }],
          intermediate: [{ title: "Freight Transport and the Modern Economy", author: "Michel Savy", description: "A comprehensive and detailed account of the principles of freight transport." }],
          advanced: [{ title: "Intermodal Freight Transport", author: "Lowe", description: "Advanced academic study of the principles and practice of intermodal transport." }]
        }
      },
      { 
        id: 'transport-tech', 
        title: 'Հաղորդակցության և տրանսպորտային տեխնոլոգիաներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Autonomous Vehicles", author: "Hod Lipson", description: "A provocative and influential account of the impact of autonomous vehicles on society." }],
          intermediate: [{ title: "Intelligent Transportation Systems", author: "Ghosh", description: "A comprehensive and detailed account of the principles of intelligent transport." }],
          advanced: [{ title: "Sustainable Transport", author: "Schiller", description: "Advanced academic study of the principles and practice of sustainable transport design." }]
        }
      },
      { 
        id: 'automotive-tech', 
        title: 'Տրանսպորտային սարքավորումներ և ավտոմոբիլային տեխնոլոգիա', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Automotive Technology Textbooks", author: "Multiple Authors", description: "Foundational principles of vehicle mechanics and technology." },
            { title: "How Cars Work", author: "Tom Newton", description: "A simplified introduction to the principles and institutions of automotive technology." }
          ],
          intermediate: [{ title: "Automotive Technology", author: "James Halderman", description: "A comprehensive and detailed account of the principles of automotive technology." }],
          advanced: [{ title: "Internal Combustion Engine Fundamentals", author: "John Heywood", description: "Advanced academic study of the principles and practice of engine design." }]
        }
      },
    ],
  },
  {
    id: 'space',
    title: 'Տիեզերք',
    icon: 'Rocket',
    subfields: [
      { 
        id: 'astronomy-observation', 
        title: 'Աստղագիտություն և դիտարկում', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Astronomy Texts", author: "Oxford University Press", description: "Foundational concepts in observational astronomy and astrophysics." },
            { title: "Cosmos", author: "Carl Sagan", description: "A classic and influential account of the nature and history of the universe." }
          ],
          intermediate: [
            { title: "Cambridge Space Science Series", author: "Cambridge University Press", description: "Academic foundation for space exploration and science." },
            { title: "The Backyard Astronomer's Guide", author: "Dickinson", description: "A lively and accessible guide to the art of astronomy and observation." }
          ],
          advanced: [
            { title: "Harvard Astrophysics Lectures", author: "Harvard University", description: "Advanced theoretical analysis of astrophysical phenomena." },
            { title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", description: "Advanced academic study of the principles and practice of astrophysics." }
          ]
        }
      },
      { 
        id: 'space-tech-satellites', 
        title: 'Տիեզերական տեխնոլոգիաներ և արբանյակներ', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Space 2.0", author: "Rod Pyle", description: "A provocative and influential account of the impact of private space exploration." }],
          intermediate: [{ title: "Satellite Technology", author: "Maini and Agrawal", description: "A comprehensive and detailed account of the principles of satellite technology." }],
          advanced: [{ title: "Space Mission Engineering: The New SMAD", author: "Wertz et al.", description: "Advanced academic study of the principles and practice of space mission design." }]
        }
      },
      { 
        id: 'planetary-molecular-science', 
        title: 'Մոլորակագիտություն և մոլեկուլային գիտություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "The Planets", author: "Brian Cox", description: "A lively and accessible account of the nature and history of the solar system." }],
          intermediate: [{ title: "Planetary Sciences", author: "de Pater and Lissauer", description: "A comprehensive and detailed account of the principles of planetary science." }],
          advanced: [{ title: "Fundamental Planetary Science", author: "Lissauer and de Pater", description: "Advanced academic study of the principles and practice of planetary science." }]
        }
      },
      { 
        id: 'space-communications', 
        title: 'Տիեզերական հաղորդակցություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Deep Space Communications", author: "Jim Taylor", description: "A concise introduction to the principles and institutions of deep space communication." }],
          intermediate: [{ title: "Space Communications", author: "Michael Rice", description: "A comprehensive and detailed account of the principles of space communication." }],
          advanced: [{ title: "Digital Communications", author: "John Proakis", description: "Advanced academic study of the principles and practice of digital communication." }]
        }
      },
      { 
        id: 'satellite-data-remote-sensing', 
        title: 'Արբանյակային տվյալների վերլուծություն / Հեռահար զոնդավորում', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Principles of Remote Sensing", author: "Multiple Authors", description: "Foundational concepts of earth observation from space." },
            { title: "Remote Sensing and GIS", author: "Basudeb Bhatta", description: "A concise introduction to the principles and institutions of remote sensing." }
          ],
          intermediate: [{ title: "Introductory Digital Image Processing", author: "Jensen", description: "A comprehensive and detailed account of the principles of digital image processing." }],
          advanced: [
            { title: "Planetary Science Notes", author: "Multiple Authors", description: "Advanced research in planetary exploration and data analysis." },
            { title: "Remote Sensing: Models and Methods for Image Processing", author: "Schowengerdt", description: "Advanced academic study of the principles and practice of remote sensing." }
          ]
        }
      },
    ],
  },
  {
    id: 'industry',
    title: 'Արդյունաբերություն',
    icon: 'Factory',
    subfields: [
      { 
        id: 'industrial-automation', 
        title: 'Արդյունաբերական ավտոմատացում', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Industrial Engineering Texts", author: "Oxford University Press", description: "Comprehensive reference for industrial systems and automation." },
            { title: "Automation, Production Systems, and Computer-Integrated Manufacturing", author: "Mikell Groover", description: "The standard academic textbook for industrial automation and manufacturing." }
          ],
          intermediate: [
            { title: "Cambridge Production Management", author: "Cambridge University Press", description: "Academic foundation for manufacturing and production systems." },
            { title: "Programmable Logic Controllers", author: "Frank Petruzella", description: "A comprehensive and detailed account of the principles of PLC programming." }
          ],
          advanced: [
            { title: "Harvard Manufacturing Case Studies", author: "Harvard University", description: "Strategic analysis of industrial production and management." },
            { title: "Industrial Automation and Process Control", author: "Jon Stenerson", description: "Advanced academic study of the principles and practice of industrial control systems." }
          ]
        }
      },
      { 
        id: 'production-management', 
        title: 'Ներդրումների և արտադրության կառավարում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Production and Operations Management", author: "Everette Adam", description: "A concise introduction to the principles and institutions of production management." }],
          intermediate: [{ title: "Manufacturing Planning and Control", author: "Vollmann", description: "A comprehensive and detailed account of the principles of manufacturing planning." }],
          advanced: [{ title: "Operations Management", author: "William Stevenson", description: "Advanced academic study of the principles and practice of operations management." }]
        }
      },
      { 
        id: 'industrial-engineering', 
        title: 'Արդյունաբերական ճարտարագիտություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Introduction to Industrial and Systems Engineering", author: "Turner", description: "A concise introduction to the principles and institutions of industrial engineering." }],
          intermediate: [{ title: "Maynard's Industrial Engineering Handbook", author: "Kjell Zandin", description: "A comprehensive and detailed account of the principles of industrial engineering." }],
          advanced: [{ title: "Operations Research", author: "Hamdy Taha", description: "Advanced academic study of the principles and practice of operations research." }]
        }
      },
      { 
        id: 'materials-science', 
        title: 'Նյութագիտություն', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Materials Science Handbook", author: "Multiple Authors", description: "Comprehensive guide to material properties and engineering." },
            { title: "Materials Science and Engineering: An Introduction", author: "Callister", description: "The standard undergraduate textbook for materials science and engineering." }
          ],
          intermediate: [{ title: "The Science and Engineering of Materials", author: "Askeland", description: "A comprehensive and detailed account of the principles of materials science." }],
          advanced: [{ title: "Introduction to Solid State Physics", author: "Charles Kittel", description: "Advanced academic study of the physical and chemical properties of solids." }]
        }
      },
      { 
        id: 'quality-control', 
        title: 'Արտադրանքի որակի վերահսկում', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Out of the Crisis", author: "W. Edwards Deming", description: "A classic and influential account of the principles of quality management." }],
          intermediate: [{ title: "Quality Control", author: "Dale Besterfield", description: "A comprehensive and detailed account of the principles of quality control." }],
          advanced: [{ title: "Statistical Quality Control", author: "Douglas Montgomery", description: "Advanced academic study of the principles and practice of statistical quality control." }]
        }
      },
    ],
  },
  {
    id: 'languages',
    title: 'Լեզուներ',
    icon: 'Languages',
    subfields: [
      { 
        id: 'armenian', 
        title: 'Հայերեն (Armenian)', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford Language Dictionaries", author: "Oxford University Press", description: "Authoritative reference for language translation and definitions." },
            { title: "Armenian for Everyone", author: "Gayane Hagopian", description: "A concise introduction to the principles and institutions of the Armenian language." }
          ],
          intermediate: [
            { title: "Cambridge Grammar & Literature", author: "Cambridge University Press", description: "Academic foundation for linguistic structures and literary analysis." },
            { title: "Modern Western Armenian", author: "Kevork Bardakjian", description: "A comprehensive and detailed account of the principles of modern Armenian." }
          ],
          advanced: [
            { title: "Harvard Language Studies", author: "Harvard University", description: "Advanced research in linguistics and philology." },
            { title: "Classical Armenian", author: "Robert Thomson", description: "Advanced academic study of the history and development of the Armenian language." }
          ]
        }
      },
      { 
        id: 'english', 
        title: 'Անգլերեն (English)', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Oxford English Grammar", author: "Sidney Greenbaum", description: "The authoritative guide to English grammar and usage." },
            { title: "English Grammar in Use", author: "Raymond Murphy", description: "A concise introduction to the principles and institutions of English grammar." }
          ],
          intermediate: [{ title: "Practical English Usage", author: "Michael Swan", description: "A comprehensive and detailed account of the principles of English usage." }],
          advanced: [{ title: "The Cambridge Encyclopedia of the English Language", author: "David Crystal", description: "Advanced academic study of the history and development of the English language." }]
        }
      },
      { 
        id: 'russian', 
        title: 'Ռուսերեն (Russian)', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Russian Grammar in Use", author: "John Dunn", description: "Practical guide to Russian grammar for beginners." },
            { title: "Russian for Dummies", author: "Andrew Kaufman", description: "A simplified introduction to the principles and institutions of the Russian language." }
          ],
          intermediate: [{ title: "The New Penguin Russian Course", author: "Nicholas J. Brown", description: "A comprehensive and detailed account of the principles of modern Russian." }],
          advanced: [{ title: "A Comprehensive Russian Grammar", author: "Terence Wade", description: "Advanced academic study of the history and development of the Russian language." }]
        }
      },
      { 
        id: 'spanish', 
        title: 'Իսպաներեն (Spanish)', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Practice Makes Perfect: Spanish Grammar", author: "Dorothy Richmond", description: "Comprehensive guide to Spanish grammar and syntax." },
            { title: "Madrigal's Magic Key to Spanish", author: "Margarita Madrigal", description: "A concise introduction to the principles and institutions of the Spanish language." }
          ],
          intermediate: [{ title: "Practice Makes Perfect: Spanish Verb Tenses", author: "Dorothy Richmond", description: "A comprehensive and detailed account of the principles of Spanish verbs." }],
          advanced: [{ title: "A New Reference Grammar of Modern Spanish", author: "Butt and Benjamin", description: "Advanced academic study of the history and development of the Spanish language." }]
        }
      },
      { 
        id: 'french', 
        title: 'Ֆրանսերեն (French)', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "Easy French Step-by-Step", author: "Myrna Bell Rochester", description: "A concise introduction to the principles and institutions of the French language." }],
          intermediate: [{ title: "Practice Makes Perfect: Complete French All-in-One", author: "Annie Heminway", description: "A comprehensive and detailed account of the principles of modern French." }],
          advanced: [{ title: "Advanced French Grammar", author: "Monique L'Huillier", description: "Advanced academic study of the history and development of the French language." }]
        }
      },
      { 
        id: 'german', 
        title: 'Գերմաներեն (German)', 
        levels: [],
        recommendedLiterature: {
          beginner: [{ title: "German Made Simple", author: "Arnold Leitner", description: "A concise introduction to the principles and institutions of the German language." }],
          intermediate: [{ title: "Hammer's German Grammar and Usage", author: "Martin Durrell", description: "A comprehensive and detailed account of the principles of modern German." }],
          advanced: [{ title: "A Practical Guide to German Grammar", author: "Derick Frewin", description: "Advanced academic study of the history and development of the German language." }]
        }
      },
      { 
        id: 'chinese', 
        title: 'Չինարեն (Chinese)', 
        levels: [],
        recommendedLiterature: {
          beginner: [
            { title: "Integrated Chinese", author: "Cheng & Tsui", description: "The leading introductory Chinese language textbook series." },
            { title: "Integrated Chinese: Level 1", author: "Yuehua Liu", description: "A concise introduction to the principles and institutions of the Chinese language." }
          ],
          intermediate: [{ title: "Modern Mandarin Chinese Grammar", author: "Claudia Ross", description: "A comprehensive and detailed account of the principles of modern Mandarin." }],
          advanced: [{ title: "Chinese: A Comprehensive Grammar", author: "Yip Po-Ching", description: "Advanced academic study of the history and development of the Chinese language." }]
        }
      },
    ],
  },
];
