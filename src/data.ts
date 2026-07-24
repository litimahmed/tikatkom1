import { Product, Category, Wilaya } from "./types";

export const translations = {
  fr: {
    logo: "TIKATKOM",
    shippingPill: "ZR Express 🚚",
    shippingTitle: "Livraison Sécurisée via ZR Express",
    shippingDesc: "Livraison ultra-rapide sur les 58 Wilayas d'Algérie. Option de livraison à domicile ou retrait directement dans l'un des bureaux officiels ZR Express.",
    shippingClose: "Compris",
    langToggle: "العربية",
    langCode: "ar",
    
    // Hero
    heroTitle: "منتجات مختارة بجودة مضمونة",
    heroSubtitle: "Découvrez notre sélection exclusive de produits haut de gamme importés et certifiés. Livraison rapide dans 58 Wilayas avec paiement sécurisé en espèces à la livraison (COD).",
    heroCTA: "Découvrir nos produits",
    heroBadge: "Boutique Officielle Algérie",
    
    // Trust Banner
    trustTitle: "Pourquoi nous faire confiance ?",
    trusts: [
      {
        title: "Service Client 7j/7",
        desc: "Conseils, suivi et assistance personnalisée par téléphone."
      },
      {
        title: "Emballage Sécurisé",
        desc: "Vos produits sont enveloppés et protégés avec un soin méticuleux."
      },
      {
        title: "Tanzil & Livraison",
        desc: "Expédition accélérée via Yalidine vers 58 wilayas à tarif réduit."
      },
      {
        title: "Qualité Garantie",
        desc: "Tous nos articles sont testés et garantis. Échange sous 48h."
      }
    ],

    // Categories
    catHeader: "Catégories Populaires",
    catSub: "Parcourez nos univers de produits sélectionnés pour leur robustesse et leur utilité au quotidien.",
    itemsCount: "articles",

    // Featured
    featHeader: "Nos Offres Vedettes",
    featSub: "Profitez de remises exclusives limitées dans le temps avec livraison express.",
    buyNow: "Acheter Maintenant",
    priceCurrency: "DA",
    stockIn: "En Stock",
    stockLow: "Stock Limité",
    stockOut: "Rupture de stock",
    reviews: "avis",

    // Checkout
    checkoutTitle: "Formulaire de Commande Rapide",
    checkoutSubTitle: "Pas de carte bancaire requise ! Remplissez ce formulaire court et payez en espèces à la livraison (Cash On Delivery).",
    formName: "Nom & Prénom",
    formPhone: "Numéro de Téléphone (Mobile)",
    formWilaya: "Wilaya (Province)",
    formCommune: "Commune (Ville)",
    formAddress: "Adresse de livraison exacte (Optionnel)",
    formDeliveryMode: "Mode de livraison",
    formHome: "À Domicile (Livraison directe)",
    formDesk: "Retrait au Bureau Yalidine",
    formQty: "Quantité",
    formNotes: "Notes de livraison (ex: heure préférée, repère)",
    formNotesPlaceholder: "Ex: Téléphoner avant de passer...",
    
    orderSummary: "Récapitulatif de votre commande",
    subtotal: "Sous-total",
    shippingFee: "Frais de livraison",
    grandTotal: "Total à payer",
    submitOrder: "Confirmer ma commande",
    submitting: "Traitement en cours...",
    
    requiredError: "Ce champ est obligatoire",
    phoneError: "Veuillez entrer un numéro de téléphone algérien valide (ex: 05, 06, 07 suivi de 8 chiffres)",
    
    successTitle: "Commande Reçue avec Succès !",
    successDesc: "Félicitations ! Votre commande a bien été enregistrée. Notre service client va vous appeler par téléphone dans les prochaines heures pour confirmer l'envoi de votre colis.",
    successCode: "Référence de votre commande :",
    successClose: "Fermer la fenêtre",

    // Features Section Header inside Modal / Detailed layout
    specifications: "Caractéristiques du produit",
    orderSecure: "Paiement 100% sécurisé à la réception du colis."
  },
  ar: {
    logo: "TIKATKOM",
    shippingPill: "ZR Express 🚚",
    shippingTitle: "شحن آمن وسريع عبر زد آر إكسبريس",
    shippingDesc: "توصيل سريع وآمن إلى جميع ولايات الوطن (58 ولاية). يمكنك اختيار التوصيل لباب المنزل مباشرة أو استلام الطرد بنفسك من مكتب زد آر إكسبريس الأقرب إليك.",
    shippingClose: "موافق",
    langToggle: "Français",
    langCode: "fr",
    
    // Hero
    heroTitle: "منتجات مختارة بجودة مضمونة",
    heroSubtitle: "اكتشف تشكيلتنا الحصرية من المنتجات المستوردة والمضمونة عالية الجودة. توصيل سريع إلى 58 ولاية مع الدفع عند الاستلام بكل أمان وراحة بال.",
    heroCTA: "اكتشف منتجاتنا",
    heroBadge: "المتجر الرسمي في الجزائر",
    
    // Trust Banner
    trustTitle: "لماذا يثق بنا آلاف الزبائن؟",
    trusts: [
      {
        title: "خدمة عملاء / Service Client",
        desc: "دعم فني واستشارات متواصلة طيلة أيام الأسبوع عبر الهاتف."
      },
      {
        title: "تغليف آمن / Emballage Sécurisé",
        desc: "مغلفة بعناية فائقة لضمان وصول المنتج إليك سليمًا وبحالة ممتازة."
      },
      {
        title: "توصيل سريع / Livraison Rapide",
        desc: "شحن سريع عبر زد آر إكسبريس إلى جميع ولايات الوطن بأسعار مخفضة."
      },
      {
        title: "جودة مضمونة / Qualité Garantie",
        desc: "جميع منتجاتنا مجربة ومضمونة. الاستبدال والاسترجاع متوفر في 48 ساعة."
      }
    ],

    // Categories
    catHeader: "الفئات الأكثر شعبية",
    catSub: "تصفح مجموعاتنا المختارة بعناية فائقة لتلبية احتياجاتكم اليومية بأفضل جودة.",
    itemsCount: "منتجات",

    // Featured
    featHeader: "عروضنا المميزة",
    featSub: "استفد من تخفيضاتنا الحصرية واللفترة محدودة مع شحن سريع.",
    buyNow: "اشتري الآن",
    priceCurrency: "دج",
    stockIn: "متوفر",
    stockLow: "كمية محدودة",
    stockOut: "نفذ من المخزن",
    reviews: "تقييمات",

    // Checkout
    checkoutTitle: "استمارة الطلب السريع",
    checkoutSubTitle: "لا تحتاج إلى بطاقة بنكية! املأ الاستمارة القصيرة أدناه وادفع نقدًا عند استلام منتجك بكل أمان.",
    formName: "الاسم واللقب بالكامل",
    formPhone: "رقم الهاتف المحمول",
    formWilaya: "الولاية",
    formCommune: "البلدية",
    formAddress: "العنوان بالتفصيل (اختياري)",
    formDeliveryMode: "طريقة التوصيل المفضل",
    formHome: "توصيل لباب المنزل مباشرة",
    formDesk: "الاستلام من مكتب زد آر إكسبريس",
    formQty: "الكمية المطلوبة",
    formNotes: "ملاحظات إضافية (مثال: وقت التوصيل المفضل، معلم قرب البيت)",
    formNotesPlaceholder: "مثال: يرجى الاتصال بي قبل القدوم...",
    
    orderSummary: "ملخص الطلب الخاص بك",
    subtotal: "المجموع الفرعي",
    shippingFee: "مصاريف التوصيل",
    grandTotal: "المجموع الإجمالي للدفع",
    submitOrder: "تأكيد الطلب الآن",
    submitting: "جاري تسجيل طلبك...",
    
    requiredError: "هذا الحقل مطلوب ولا يمكن تركه فارغاً",
    phoneError: "يرجى إدخال رقم هاتف جزائري صحيح (مثال: 05، 06، 07 متبوعًا بـ 8 أرقام)",
    
    successTitle: "تم تسجيل طلبك بنجاح!",
    successDesc: "شكراً لثقتك بنا! تم تسجيل طلبك في نظامنا بنجاح. سيتصل بك أحد موظفي خدمة العملاء قريباً لتأكيد طلبك وتجهيزه للشحن مباشرة.",
    successCode: "رمز تتبع طلبك :",
    successClose: "إغلاق النافذة",

    specifications: "مواصفات ومميزات المنتج",
    orderSecure: "الدفع عند الاستلام 100% آمن وموثوق."
  }
};

export const categories: Category[] = [
  {
    id: "electronics",
    nameFR: "Électronique & High-Tech",
    nameAR: "إلكترونيات وتكنولوجيا",
    image: "/src/assets/images/cat_electronics_1784436441215.jpg",
    count: 12
  },
  {
    id: "accessories",
    nameFR: "Accessoires & Style",
    nameAR: "إكسسوارات وأناقة",
    image: "/src/assets/images/product_wallet_1784436470979.jpg",
    count: 8
  },
  {
    id: "home",
    nameFR: "Maison & Bien-être",
    nameAR: "المنزل والراحة",
    image: "/src/assets/images/cat_home_1784436456290.jpg",
    count: 15
  }
];

export const products: Product[] = [
  {
    id: "1",
    titleFR: "Montre Intelligente Pro T900 Ultra - Édition Spéciale",
    titleAR: "ساعة ذكية برو T900 ألترا - الإصدار الخاص",
    descriptionFR: "Découvrez la liberté d'un suivi santé et d'une connectivité sans faille. Écran Retina HD incurvé, appels Bluetooth, capteurs cardiaques haute précision, étanchéité IP68 et autonomie exceptionnelle de 7 jours. Cadre en aluminium de qualité aéronautique avec bracelet en silicone émeraude premium.",
    descriptionAR: "اكتشف متعة التكنولوجيا المتقدمة وتتبع صحتك بكل سهولة. شاشة Retina HD منحنية، إمكانية إجراء واستقبال المكالمات عبر البلوتوث، حساسات نبضات القلب والأنشطة الرياضية بدقة متناهية، مقاومة كاملة للماء والغبار IP68، بطارية تدوم حتى 7 أيام. هيكل من الألمنيوم المتين مع سوار سيليكون راقي باللون الأخضر الزمردي.",
    price: 6200,
    oldPrice: 8500,
    image: "/src/assets/images/hero_smartwatch_1784436429431.jpg",
    category: "electronics",
    badgeFR: "OFFRE SPÉCIALE -27%",
    badgeAR: "عرض خاص -27%",
    rating: 4.8,
    reviewsCount: 142,
    stockStatus: "low_stock",
    featuresFR: [
      "Appels Bluetooth HD & notifications instantanées (SMS, Facebook, WhatsApp)",
      "Suivi d'activité physique complet (course, vélo, pas, calories dépensées)",
      "Capteur de rythme cardiaque, pression artérielle et taux d'oxygène",
      "Écran tactile ultra-lumineux incurvé de 2.02 pouces",
      "Compatible Android et iOS avec application dédiée en français/arabe"
    ],
    featuresAR: [
      "إجراء واستقبال المكالمات بجودة صوت عالية وتلقي جميع التنبيهات (فيسبوك، واتساب، رسائل)",
      "تتبع كامل للأنشطة الرياضية (الجري، المشي، ركوب الدراجة، حرق السعرات)",
      "قياس معدل ضربات القلب، ضغط الدم، ونسبة الأكسجين بدقة",
      "شاشة لمسية كاملة فائقة السطوع ومنحنية بمقاس 2.02 بوصة",
      "متوافقة تمامًا مع هواتف أندرويد وآيفون مع تطبيق يدعم العربية والفرنسية"
    ]
  },
  {
    id: "2",
    titleFR: "Écouteurs Bass+ ANC Réduction de Bruit Active",
    titleAR: "سماعات الأذن اللاسلكية Bass+ بخاصية إلغاء الضوضاء",
    descriptionFR: "Plongez dans un son de qualité studio sans distractions. Les écouteurs Bass+ intègrent une puce audio avancée avec réduction active de bruit ambiant (ANC), des basses profondes équilibrées et une autonomie de 24h avec boîtier de charge.",
    descriptionAR: "انغمس في تجربة صوتية نقية بجودة الاستوديو دون أي تشويش خارجي. تتميز سماعات Bass+ بشريحة معالجة صوتية متطورة، خاصية إلغاء الضوضاء النشطة (ANC)، جهير صوتي (Bass) عميق ومتوازن، وبطارية مذهلة تدوم 24 ساعة مع حافظة الشحن الذكية.",
    price: 3900,
    oldPrice: 5500,
    image: "/src/assets/images/cat_electronics_1784436441215.jpg",
    category: "electronics",
    badgeFR: "MEILLEURE VENTE",
    badgeAR: "الأكثر مبيعًا",
    rating: 4.7,
    reviewsCount: 96,
    stockStatus: "in_stock",
    featuresFR: [
      "Réduction active du bruit ambiant (ANC) jusqu'à 25dB",
      "Autonomie de 6 heures par charge (24 heures au total avec le boîtier)",
      "Contrôle tactile intelligent sur chaque écouteur",
      "Microphones intégrés haute définition pour des appels limpides",
      "Connexion instantanée Bluetooth 5.3 ultra-stable"
    ],
    featuresAR: [
      "تقنية عزل الضوضاء النشطة (ANC) لعزل يصل إلى 25 ديسيبل",
      "بطارية قوية تدوم 6 ساعات متواصلة (إجمالي 24 ساعة مع علبة الشحن)",
      "تحكم باللمس ذكي وسلس على كلتا السماعتين",
      "ميكروفونات مدمجة عالية الدقة لمكالمات هاتفية واضحة جداً",
      "اتصال لاسلكي فوري وثابت بتقنية بلوتوث 5.3"
    ]
  },
  {
    id: "3",
    titleFR: "Humidificateur d'Air Zen Ultra-Silencieux Effet Bois",
    titleAR: "مرطب وموزع الروائح العطرية Zen هادئ جداً بتصميم خشبي",
    descriptionFR: "Améliorez la qualité de l'air de votre maison ou bureau tout en ajoutant une touche chaleureuse. Ce diffuseur d'arômes à ultrasons brumise délicatement l'eau et les huiles essentielles avec un éclairage LED d'ambiance ultra-relaxant.",
    descriptionAR: "حسن جودة الهواء في منزلك أو مكتبك وأضف لمسة جمالية دافئة. يقوم هذا الموزع بالموجات فوق الصوتية بنشر رذاذ خفيف من الماء والزيوت العطرية بلطف شديد، مع إضاءة LED مهدئة ومثالية للاسترخاء التام.",
    price: 4800,
    oldPrice: 6500,
    image: "/src/assets/images/cat_home_1784436456290.jpg",
    category: "home",
    badgeFR: "INDISPENSABLE MAISON",
    badgeAR: "مهم لكل منزل",
    rating: 4.9,
    reviewsCount: 81,
    stockStatus: "in_stock",
    featuresFR: [
      "Diffusion par ultrasons pour préserver les vertus des huiles essentielles",
      "Éclairage LED d'ambiance avec 7 couleurs sélectionnables ou mode cyclique",
      "Capacité de 400ml pour une diffusion continue jusqu'à 10 heures",
      "Arrêt automatique de sécurité dès que le réservoir est vide",
      "Fonctionnement ultra-silencieux idéal pour la chambre ou le bureau"
    ],
    featuresAR: [
      "توزيع بالموجات فوق الصوتية للحفاظ على الفوائد الطبيعية للزيوت العطرية",
      "إضاءة ليد خافتة بـ 7 ألوان هادئة يمكن تثبيتها أو جعلها تتغير تلقائياً",
      "سعة خزان 400 مل تدوم وتعمل بشكل مستمر حتى 10 ساعات كاملة",
      "خاصية الإيقاف التلقائي الذكي فور نفاد الماء لحماية الجهاز",
      "تصميم هادئ جداً لا يسبب أي إزعاج، مثالي أثناء النوم أو العمل"
    ]
  },
  {
    id: "4",
    titleFR: "Portefeuille Intelligent RFID & Fibre de Carbone Émeraude",
    titleAR: "محفظة كروت ذكية ضد السرقة والنسخ RFID بلمسة الزمرد",
    descriptionFR: "Sécurisez vos cartes bancaires et documents avec élégance. Conçu en fibre de carbone ultra-légère et robuste avec des finitions émeraude exclusives. Système d'éjection de cartes rapide breveté.",
    descriptionAR: "احمِ بطاقاتك ومعلوماتك الشخصية بأناقة وأمان. مصممة من ألياف الكربون فائقة الخفة والمتانة مع لمسات راقية باللون الأخضر الزمردي الخلاب. تحتوي على نظام ذكي وسريع لإخراج الكروت بضغطة زر واحدة.",
    price: 2900,
    oldPrice: 3900,
    image: "/src/assets/images/product_wallet_1784436470979.jpg",
    category: "accessories",
    badgeFR: "DESIGN COMPACT",
    badgeAR: "تصميم مدمج وأنيق",
    rating: 4.6,
    reviewsCount: 57,
    stockStatus: "in_stock",
    featuresFR: [
      "Protection RFID/NFC intégrée pour bloquer le piratage sans contact",
      "Mécanisme d'éjection rapide pouvant contenir jusqu'à 6 cartes",
      "Compartiment supplémentaire pour billets de banque en espèces",
      "Poids ultra-léger et profil ultra-fin de seulement 8mm d'épaisseur",
      "Matériaux nobles : Cuir véritable premium et alliage d'aluminium"
    ],
    featuresAR: [
      "حماية مدمجة ضد السرقة والنسخ الإلكتروني اللاسلكي للبطاقات (RFID/NFC)",
      "زر ميكانيكي ذكي يتيح إخراج الكروت بتدرج رائع يتسع لـ 6 بطاقات",
      "جيب إضافي مخصص لحمل النقود الورقية والعملات النقدية بأمان",
      "وزن خفيف جداً وتصميم نحيف جداً بسمك 8 ملم فقط ليناسب جيبك بسهولة",
      "مصنوعة من مواد ممتازة: جلد طبيعي فاخر وهيكل ألمنيوم صلب"
    ]
  },
  {
    id: "5",
    titleFR: "Station de Charge Sans Fil MagSafe 3-en-1 Premium",
    titleAR: "شاحن لاسلكي سريع مغناطيسي MagSafe 3 في 1 الفاخر",
    descriptionFR: "Dites adieu aux câbles encombrants. Chargez simultanément votre smartphone, vos écouteurs et votre montre connectée avec une seule prise de courant. Support magnétique ultra-puissant et charge ultra-rapide.",
    descriptionAR: "ودع فوضى الأسلاك والوصت المتشابكة على مكتبك. اشحن هاتفك الذكي، سماعتك اللاسلكية وساعتك الذكية في نفس الوقت وبسرعة فائقة باستخدام كابل واحد فقط. مزود بمغناطيس قوي جداً وشاحن سريع آمن.",
    price: 5400,
    oldPrice: 7500,
    image: "/src/assets/images/product_charger_1784436485346.jpg",
    category: "electronics",
    badgeFR: "PRODUIT HIGH-TECH",
    badgeAR: "منتج ذكي ومميز",
    rating: 4.8,
    reviewsCount: 110,
    stockStatus: "in_stock",
    featuresFR: [
      "Charge sans fil ultra-rapide intelligente jusqu'à 15W",
      "Support d'alignement magnétique fort compatible MagSafe",
      "Indicateur LED d'état de charge subtil et désactivable",
      "Protections intégrées contre les surchauffes et surtensions",
      "Design épuré en alliage d'aluminium idéal pour table de nuit ou bureau"
    ],
    featuresAR: [
      "شحن لاسلكي ذكي فائق السرعة يدعم قوة تصل إلى 15 واط",
      "حامل مغناطيسي قوي ومحاذاة مثالية متوافق مع هواتف الآيفون الحديثة",
      "مؤشر ليد هادئ لمعرفة حالة الشحن يمكن إيقاف تشغيله بسهولة",
      "أنظمة حماية مدمجة متقدمة ضد الحرارة المرتفعة والجهد الزائد",
      "تصميم راقي وجذاب من الألمنيوم يزين طاولة نومك أو مكتب عملك"
    ]
  },
  {
    id: "6",
    titleFR: "Hachoir Électrique Multifonction en Inox Premium",
    titleAR: "مفرمة اللحم الكهربائية متعددة الوظائف من الفولاذ المقاوم للصدأ",
    descriptionFR: "Préparez vos repas en un temps record. Ce hachoir puissant de 500W possède un bol en inox de 2L incassable et 4 lames tranchantes en acier chirurgical.",
    descriptionAR: "حضري ألذ المأكولات في وقت قياسي. مفرمة قوية بقدرة 500 واط مجهزة بوعاء فولاذي غير قابل للكسر بسعة 2 لتر و4 شفرات حادة للغاية مصنوعة من الفولاذ الجراحي.",
    price: 4200,
    oldPrice: 5800,
    image: "/src/assets/images/cat_home_1784436456290.jpg",
    category: "home",
    badgeFR: "INDISPENSABLE CUISINE",
    badgeAR: "مهم للمطبخ",
    rating: 4.7,
    reviewsCount: 68,
    stockStatus: "in_stock",
    featuresFR: [
      "Moteur puissant de 500W avec protection contre la surchauffe",
      "Bol en acier inoxydable de 2 litres robuste et sain",
      "4 lames en acier inoxydable chirurgical double niveau",
      "Deux vitesses de fonctionnement (rapide/lente)",
      "Facile à démonter et lavable au lave-vaisselle"
    ],
    featuresAR: [
      "محرك قوي بقدرة 500 واط مع نظام حماية مدمج ضد السخونة الزائدة",
      "وعاء فولاذي متين وصحي مقاوم للصدأ بسعة 2 لتر",
      "4 شفرات مزدوجة حادة للغاية مصنوعة من الفولاذ المقاوم للصدأ",
      "سرعتان للتشغيل والتحكم في درجة الفرم (سريع/بطيء)",
      "سهلة التفكيك والتنظيف وتصلح للغسل في غسالة الصحون"
    ]
  },
  {
    id: "7",
    titleFR: "Épilateur Laser IPL Professionnel Sans Douleur",
    titleAR: "جهاز إزالة الشعر بالليزر الاحترافي IPL بدون ألم",
    descriptionFR: "Profitez d'une peau lisse comme de la soie à domicile. Cet épilateur à technologie de lumière pulsée IPL réduit visiblement les poils dès 4 semaines avec un mode de refroidissement breveté ultra-doux.",
    descriptionAR: "استمتعي ببشرة ناعمة كالحرير في منزلك بكل خصوصية. جهاز إزالة الشعر بتقنية الضوء النبضي المكثف (IPL) يقلل نمو الشعر بنسبة ملحوظة بعد 4 أسابيع فقط، مجهز بنظام تبريد لحماية البشرة وضمان تجربة مريحة.",
    price: 9500,
    oldPrice: 14000,
    image: "/src/assets/images/cat_home_1784436456290.jpg",
    category: "home",
    badgeFR: "OFFRE EXCLUSIVE -32%",
    badgeAR: "عرض حصري -32%",
    rating: 4.9,
    reviewsCount: 43,
    stockStatus: "low_stock",
    featuresFR: [
      "Technologie de lumière pulsée IPL avancée avec 990 000 flashs",
      "Système de refroidissement par glace intégré pour éviter toute douleur",
      "5 niveaux d'intensité réglables selon votre type de peau",
      "Deux modes d'utilisation : flash manuel et flash automatique continu",
      "Appareil certifié CE avec lunettes de protection et rasoir inclus"
    ],
    featuresAR: [
      "تقنية نبضات الضوء المكثف (IPL) مع عمر طويل يصل إلى 990,000 ومضة",
      "نظام تبريد ثلجي متطور مدمج لضمان تجربة آمنة تماماً وبدون ألم",
      "5 مستويات طاقة قابلة للتعديل لتناسب درجات حساسية ولون البشرة",
      "وضعان للوميض: وميض يدوي للمناطق الدقيقة وتلقائي مستمر للمناطق الكبيرة",
      "جهاز معتمد ومعبأ مع نظارات حماية وشفرة حلاقة مخصصة مجاناً"
    ]
  },
  {
    id: "8",
    titleFR: "Organisateur de Voyage Cuir Luxe & Protection RFID",
    titleAR: "حقيبة تنظيم مستندات السفر وجوازات السفر الجلدية الفاخرة",
    descriptionFR: "Gardez vos documents de voyage importants organisés et sécurisés. Ce portefeuille spacieux contient des emplacements dédiés pour passeports, cartes d'embarquement, devises, et intègre un blindage RFID total.",
    descriptionAR: "احتفظ بجميع مستندات سفرك الهامة منظمة وفي مكان واحد آمن. تتسع هذه المحفظة الأنيقة لحمل عدة جوازات سفر، تذاكر الطيران، العملات الورقية والمعدنية، مع حماية مدمجة ضد النسخ الإلكتروني.",
    price: 3500,
    oldPrice: 4900,
    image: "/src/assets/images/product_wallet_1784436470979.jpg",
    category: "accessories",
    badgeFR: "ÉDITION PREMIUM",
    badgeAR: "نسخة ممتازة فاخرة",
    rating: 4.8,
    reviewsCount: 31,
    stockStatus: "in_stock",
    featuresFR: [
      "Matériau : Cuir Saffiano véritable résistant aux rayures",
      "Protection RFID complète pour sécuriser vos données personnelles",
      "Contient 4 emplacements passeport, 8 emplacements cartes et un grand compartiment billets",
      "Fermeture zippée fluide YKK de haute qualité",
      "Taille compacte élégante facile à glisser en sac à main ou cabine"
    ],
    featuresAR: [
      "الخامة: جلد سافيانو الطبيعي الفاخر المقاوم للخدش والماء",
      "حماية كاملة بتقنية RFID لمنع قراءة بيانات بطاقاتك الشخصية",
      "تتسع لـ 4 جوازات سفر، 8 بطاقات بنكية، وجيب كبير للنقود الورقية",
      "سحاب معدني قوي وناعم جداً من ماركة YKK الشهيرة لمتانة تدوم طويلاً",
      "حجم مدمج وأنيق يسهل حملها باليد أو وضعها في حقيبة السفر"
    ]
  }
];

export const digitalProducts: Product[] = [
  {
    id: "dig-1",
    titleFR: "Abonnement Netflix Premium 4K Ultra HD (12 Mois)",
    titleAR: "اشتراك نتفليكس بريميوم 4K Ultra HD (12 شهر)",
    descriptionFR: "Accès garanti à Netflix Premium 4K Ultra HD sur vos écrans. Profil privé sécurisé avec votre propre PIN, qualité vidéo maximale et garantie totale durant toute la durée de l'abonnement.",
    descriptionAR: "حساب نتفليكس بريميوم رسمي بأعلى دقة 4K Ultra HD. ملف شخصي خاص بك ومحمي برقم سري (PIN)، مشاهدة بدون انقطاع مع ضمان كامل وشامل طيلة فترة الاشتراك.",
    price: 3200,
    oldPrice: 5000,
    image: "/src/assets/images/bento_vip_apps_1784816619708.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "vip_subscriptions",
    badgeFR: "LIVRAISON INSTANTANÉE",
    badgeAR: "تسليم فوري 24/7",
    rating: 4.9,
    reviewsCount: 328,
    stockStatus: "in_stock",
    featuresFR: [
      "Profil privé sécurisé avec votre code PIN personnel",
      "Résolution 4K Ultra HD + HDR et son Spatial Audio",
      "Garantie de remplacement automatique 12 mois",
      "Livraison automatique des identifiants en moins de 5 minutes",
      "Compatible Smart TV, Téléphone, PC et Tablettes"
    ],
    featuresAR: [
      "بروفايل شخصي خاص بك ومحمي برمز PIN سري",
      "جودة عرض فائقة 4K Ultra HD مع دعم HDR وصوت سينمائي",
      "ضمان استبدال مباشر وتلقائي طيلة الـ 12 شهراً",
      "تسليم فوري لتفاصيل الحساب في أقل من 5 دقائق",
      "يعمل على التلفزيون الذكي، الهاتف، الكمبيوتر والتابلت"
    ]
  },
  {
    id: "dig-2",
    titleFR: "Abonnement Spotify Premium (12 Mois)",
    titleAR: "اشتراك سبوتيفاي بريميوم (12 شهر)",
    descriptionFR: "Écoutez toute votre musique préférée sans aucune publicité et hors ligne. Activation directe sur votre propre compte personnel Spotify sans changement d'identifiant.",
    descriptionAR: "استمع لموسيقاك وبودكاستك المفضل بدون إعلانات وبجودة صوت فائقة مع إمكانية التحميل والاستماع أوفلاين. تفعيل مباشر على حسابك الشخصي الحالي في سبوتيفاي.",
    price: 2400,
    oldPrice: 4200,
    image: "/src/assets/images/bento_vip_apps_1784816619708.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "vip_subscriptions",
    badgeFR: "COMPTE PERSONNEL",
    badgeAR: "على حسابك الشخصي",
    rating: 4.8,
    reviewsCount: 194,
    stockStatus: "in_stock",
    featuresFR: [
      "Activation directe sur votre adresse email personnelle",
      "Écoute hors ligne (Téléchargement illimité des playlists)",
      "Qualité audio maximale Très Haute Définition (320 kbps)",
      "Zéro publicité et zapping illimité",
      "Garantie officielle 1 an"
    ],
    featuresAR: [
      "تفعيل مباشر رسمي على بريدك الإلكتروني الشخصي",
      "تحميل الأغاني والبودكاست للاستماع بدون إنترنت",
      "جودة صوت نقية وفائقة الدقة 320 كيلو بت في الثانية",
      "بدون إعلانات وتنقل غير محدود بين الأغاني",
      "ضمان رسمي لمدة سنة كاملة"
    ]
  },
  {
    id: "dig-3",
    titleFR: "Abonnement Shahid VIP + Sport (12 Mois)",
    titleAR: "اشتراك شاهد VIP + الرياضة (12 شهر)",
    descriptionFR: "Profitez des meilleurs films, séries arabes exclusives et des grands événements sportifs en direct (Roshn Saudi League, Formula 1, Champions League) en HD.",
    descriptionAR: "استمتع بمشاهدة أحدث الأفلام والمسلسلات العربية الحصرية، بالإضافة إلى البث المباشر لأهم البطولات الرياضية العالمية والدوري السعودي بوضوح عالي HD.",
    price: 3900,
    oldPrice: 6500,
    image: "/src/assets/images/bento_vip_apps_1784816619708.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "vip_subscriptions",
    badgeFR: "INCLUS SPORT HD",
    badgeAR: "شامل الرياضة والمسلسلات",
    rating: 4.9,
    reviewsCount: 215,
    stockStatus: "in_stock",
    featuresFR: [
      "Accès complet aux chaînes Sport HD et événements en direct",
      "Sans interruption publicitaire et qualité Full HD",
      "Téléchargement pour visionnage hors ligne",
      "Garantie continue 12 mois",
      "Activation rapide"
    ],
    featuresAR: [
      "تغطية كاملة للقنوات الرياضية البث المباشر والمباريات",
      "مشاهدة بدون فواصل إعلانية وبجودة Full HD",
      "إمكانية تحميل المحتوى للمشاهدة بدون إنترنت",
      "ضمان مستمر طوال فترة الاشتراك 12 شهراً",
      "تفعيل وتكريس سريع ومضمون"
    ]
  },
  {
    id: "dig-4",
    titleFR: "Licence Officielle Windows 11 Pro - Clé Retail À Vie",
    titleAR: "مفتاح تفعيل ويندوز 11 برو الأصلي (مدى الحياة)",
    descriptionFR: "Clé d'activation officielle Microsoft Windows 11 Professionnel. Activation en ligne immédiate liée à la carte mère de votre PC. Mises à jour officielles garanties à vie.",
    descriptionAR: "مفتاح تفعيل أصلي ورسمي 100% من مايكروسوفت لويندوز 11 برو. تفعيل أونلاين مباشر يرتبط بلوحة الأم لجهازك، ويضمن لك الحصول على كافة التحديثات الأمنية مدى الحياة.",
    price: 1800,
    oldPrice: 3500,
    image: "/src/assets/images/bento_software_keys_1784816632444.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "activation_keys",
    badgeFR: "CLÉ OFFICIELLE RETAIL",
    badgeAR: "تفعيل أونلاين مدى الحياة",
    rating: 5.0,
    reviewsCount: 412,
    stockStatus: "in_stock",
    featuresFR: [
      "Clé officielle Retail réutilisable sur le même PC",
      "Activation directe via les paramètres Windows",
      "Support multilingue (Français, Arabe, Anglais)",
      "Mises à jour Microsoft garanties à vie",
      "Envoi immédiat de la clé par SMS et Email"
    ],
    featuresAR: [
      "مفتاح تفعيل أونلاين رسمي Retail يرتبط بجهازك",
      "تفعيل مباشر وسهل من إعدادات الويندوز في ثوانٍ",
      "يدعم جميع اللغات (العربية، الفرنسية، الإنجليزية)",
      "تحديثات أمان مستمرة ومضمونة من مايكروسوفت",
      "إرسال فوري للمفتاح عبر الرسائل القصيرة والبريد"
    ]
  },
  {
    id: "dig-5",
    titleFR: "Microsoft Office 2021 Professional Plus (Clé À Vie)",
    titleAR: "مايكروسوفت أوفيس 2021 برو بلس (مفتاح مدى الحياة)",
    descriptionFR: "Suite bureautique complète comprenant Word, Excel, PowerPoint, Outlook, Access et Publisher. Licence permanente sans abonnement mensuel.",
    descriptionAR: "الحزمة المكتبيّة الكاملة التي تشمل وورد، إكسل، باوربوينت، أوتلوك، وأكسس. ترخيص دائم مدى الحياة بدون أي رسوم أو اشتراكات شهرية.",
    price: 2200,
    oldPrice: 4000,
    image: "/src/assets/images/bento_software_keys_1784816632444.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "activation_keys",
    badgeFR: "SANS ABONNEMENT",
    badgeAR: "ترخيص دائم مدى الحياة",
    rating: 4.9,
    reviewsCount: 289,
    stockStatus: "in_stock",
    featuresFR: [
      "Inclus : Word, Excel, PowerPoint, Outlook, Publisher, Access",
      "Activation permanente pour 1 PC Windows",
      "Téléchargement direct depuis le site officiel Microsoft",
      "Prise en charge de toutes les langues",
      "Clé d'activation authentique"
    ],
    featuresAR: [
      "يتضمن: Word, Excel, PowerPoint, Outlook, Publisher, Access",
      "تفعيل دائم لجهاز كمبيوتر واحد يعمل بنظام ويندوز",
      "تحميل مباشر ورسمي من موقع مايكروسوفت الرسمي",
      "دعم كامل للغة العربية والفرنسية والإنجليزية",
      "مفتاح تفعيل أصلـي مع دليل التثبيت بالخطوات"
    ]
  },
  {
    id: "dig-6",
    titleFR: "Compte ChatGPT Plus / OpenAI GPT-4o (1 Mois / 1 An)",
    titleAR: "اشتراك تشات جي بي تي بلس ChatGPT Plus / GPT-4o",
    descriptionFR: "Débloquez la puissance maximale de l'Intelligence Artificielle avec GPT-4o, génération d'images DALL-E 3, analyse de documents et accès prioritaire sans attente.",
    descriptionAR: "افتح القوة الكاملة للذكاء الاصطناعي مع نموذج GPT-4o الفائق، توليد الصور المتقدم DALL-E 3، تحليل المستندات والبيانات، وسرعة استجابة فائقة بدون انتظار.",
    price: 2900,
    oldPrice: 4500,
    image: "/src/assets/images/bento_ai_tools_1784816644259.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "ai_tools",
    badgeFR: "ACCÈS GPT-4o & DALL-E 3",
    badgeAR: "نسخة GPT-4o الرسمية",
    rating: 4.9,
    reviewsCount: 178,
    stockStatus: "in_stock",
    featuresFR: [
      "Accès garanti au dernier modèle GPT-4o et GPT-4 Turbo",
      "Génération d'images haute qualité avec DALL-E 3",
      "Analyse avancée de données, fichiers PDF et code",
      "Vitesse de réponse ultra-rapide 24/7",
      "Support et garantie pendant toute la période"
    ],
    featuresAR: [
      "وصول مضمون لأحدث نموذج ذكاء اصطناعي GPT-4o",
      "توليد الصور الاحترافية عالية الدقة بواسطة DALL-E 3",
      "تحليل الملفات المستندات الـ PDF والأكواد البرمجية",
      "استجابة سريعة جداً بدون أي انقطاع",
      "دعم وضمان كامل لم المذة المحددة"
    ]
  },
  {
    id: "dig-7",
    titleFR: "Abonnement Canva Pro (12 Mois)",
    titleAR: "اشتراك كانفا برو Canva Pro (12 شهر)",
    descriptionFR: "Accédez à plus de 100 millions d'éléments graphiques, suppression d'arrière-plan en 1 clic, redimensionnement magique et des milliers de modèles premium.",
    descriptionAR: "احصل على وصول كامل لأكثر من 100 مليون عنصر جرافيك، إزالة خلفية الصور بضغطة زر واحدة، تغيير أحجام التصاميم بذكاء، وآلاف القوالب المدفوعة.",
    price: 1500,
    oldPrice: 3000,
    image: "/src/assets/images/bento_ai_tools_1784816644259.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "ai_tools",
    badgeFR: "SUR VOTRE EMAIL",
    badgeAR: "تفعيل على إيميلك الخاص",
    rating: 5.0,
    reviewsCount: 520,
    stockStatus: "in_stock",
    featuresFR: [
      "Invitation officielle envoyée directement sur votre compte email Canva",
      "Suppresseur d'arrière-plan d'image IA en un clic",
      "Espace de stockage cloud de 1 To",
      "Accès aux outils d'édition IA avancés (Magic Edit, Redimensionnement)",
      "Garantie 12 mois sans coupure"
    ],
    featuresAR: [
      "دعوة رسمية ترسل مباشرة إلى حسابك الخاص في كانفا",
      "أداة إزالة خلفية الصور بالذكاء الاصطناعي بنقرة واحدة",
      "مساحة تخزين سحابية ضخمة 1 تيرابايت",
      "أدوات الذكاء الاصطناعي السحرية لتعديل وتكبير التصاميم",
      "ضمان لمدة 12 شهراً بدون أي انقطاع"
    ]
  },
  {
    id: "dig-8",
    titleFR: "Pack Formation Marketing Digital & E-Commerce 2026",
    titleAR: "حقيبة كورسات وكتب التسويق الرقمي والتجارة الإلكترونية",
    descriptionFR: "Pack complet incluant 15+ formations vidéo HD et 30+ e-books pratiques pour maîtriser la publicité Facebook/TikTok Ads, la création de boutiques et le dropshipping.",
    descriptionAR: "حقيبة تدريبية شاملة تحتوي على أكثر من 15 دورة فيديو عالية الدقة و30 كتاباً إلكترونياً لتعلم إعلانات فيسبوك وتيك توك، إنشاء المتاجر، والتجارة الإلكترونية.",
    price: 2500,
    oldPrice: 6000,
    image: "/src/assets/images/bento_ebooks_courses_1784816657536.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "ebooks_courses",
    badgeFR: "15+ FORMATIONS & EBOOKS",
    badgeAR: "دورة شاملة + كتب إلكترونية",
    rating: 4.8,
    reviewsCount: 145,
    stockStatus: "in_stock",
    featuresFR: [
      "Accès à vie à Google Drive avec mises à jour gratuites",
      "Formations vidéo complètes en arabe et français",
      "Guides pratiques étape par étape pour Facebook & TikTok Ads",
      "Modèles de stratégie et fiches de calcul de rentabilité incluses",
      "Téléchargement illimité sur tous vos appareils"
    ],
    featuresAR: [
      "وصول مدى الحياة عبر جوجل درايف مع تحديثات مجانية",
      "كورس فيديو تفصيلي ومكتمل باللغة العربية والفرنسية",
      "شرح عملي خطوة بخطوة لإعلانات فيسبوك، انستغرام وتيك توك",
      "ملفات وقوالب حساب الأرباح واستراتيجيات التسويق جاهزة",
      "تحميل غير محدود على هاتفك أو جهاز الكمبيوتر"
    ]
  },
  {
    id: "dig-9",
    titleFR: "Carte Cadeau Google Play $25 USD / EUR",
    titleAR: "بطاقة هدايا جوجل بلاي Google Play $25",
    descriptionFR: "Rechargez votre solde Google Play en un instant pour acheter des jeux, des applications, des diamants Free Fire, PUBG UC ou des abonnements in-app.",
    descriptionAR: "اشحن رصيد حسابك في جوجل بلاي فوراً لشراء الألعاب، التطبيقات، شحن جواهر فري فاير، شدات ببجي أو الاشتراكات داخل التطبيقات بسهولة وأمان.",
    price: 3800,
    oldPrice: 4500,
    image: "/src/assets/images/bento_gift_cards_1784816668964.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "gift_cards",
    badgeFR: "CODE INSTANTANÉ",
    badgeAR: "كود شحن فوري",
    rating: 4.9,
    reviewsCount: 310,
    stockStatus: "in_stock",
    featuresFR: [
      "Code officiel à 16 chiffres prêt à être activé",
      "Compatible avec le Google Play Store US / FR",
      "Livraison immédiate par SMS ou WhatsApp après validation",
      "Garantie d'authenticité 100%",
      "Support d'aide à l'activation si besoin"
    ],
    featuresAR: [
      "كود رسمي مكون من 16 رقم جاهز للتفعيل الفوري",
      "متوافق مع متجر جوجل بلاي الأمريكي أو الفرنسي",
      "إرسال فوري للكود عبر SMS أو واتساب فور الشراء",
      "ضمان أصالة الكود 100%",
      "دعم المساعدة في تفعيل الكود إذا لزم الأمر"
    ]
  },
  {
    id: "dig-10",
    titleFR: "Pack 500+ Templates Social Media Canva & Photoshop",
    titleAR: "حزمة 500+ قالب تصميم جاهز للسوشيال ميديا",
    descriptionFR: "Collection massive de modèles de publications, stories et bannières professionnels entièrement modifiables sur Canva et Photoshop pour booster vos réseaux.",
    descriptionAR: "مجموعة ضخمة من قوالب المنشورات والستوريات الإعلانية الاحترافية الجاهزة للتعديل الكامل على كانفا وفوتوشوب لتطوير حساباتك ومتجرك بسهولة.",
    price: 1900,
    oldPrice: 3800,
    image: "/src/assets/images/bento_design_templates_1784816681609.jpg",
    category: "digital",
    isDigital: true,
    digitalCategory: "design_templates",
    badgeFR: "MODIFIABLE EN 1 CLIC",
    badgeAR: "جاهزة للتعديل السريع",
    rating: 4.9,
    reviewsCount: 167,
    stockStatus: "in_stock",
    featuresFR: [
      "Plus de 500 designs modernes classés par domaine (E-commerce, Resto, High-Tech)",
      "Liens Canva directs + Fichiers source PSD Photoshop inclus",
      "Typographies et éléments libres de droits inclus",
      "Téléchargement direct et immédiat",
      "Utilisation commerciale autorisée"
    ],
    featuresAR: [
      "أكثر من 500 تصميم حديث مقسم حسب المجالات (تجارة، مطاعم، تقنية)",
      "روابط كانفا مباشرة + ملفات المصدر PSD بفوتوشوب متضمنة",
      "خطوط وعناصر جرافيك مجانية وحرة الاستخدام",
      "تحميل مباشر وفوري بعد الشراء",
      "ترخيص استخدام تجاري مفتوح"
    ]
  }
];

export const AlgerianWilayas: Wilaya[] = [
  {
    code: "16",
    nameFR: "Alger",
    nameAR: "الجزائر",
    homePrice: 400,
    deskPrice: 250,
    communes: ["Alger Centre", "Bab El Oued", "Hydra", "El Harrach", "Rouiba", "Cheraga", "Sidi M'hamed", "Zeralda", "Bordj El Kiffan", "Ain Taya", "Bir Mourad Rais", "Beni Messous", "Baraki", "Draria", "Reghaia"]
  },
  {
    code: "31",
    nameFR: "Oran",
    nameAR: "وهران",
    homePrice: 550,
    deskPrice: 350,
    communes: ["Oran", "Bir El Djir", "Es Senia", "Arzew", "Gdyel", "Ain El Turk", "Bethioua", "Mers El Kebir", "Oued Tlelat"]
  },
  {
    code: "25",
    nameFR: "Constantine",
    nameAR: "قسنطينة",
    homePrice: 550,
    deskPrice: 350,
    communes: ["Constantine", "El Khroub", "Hamma Bouziane", "Didouche Mourad", "Zighoud Youcef", "Ain Smara", "Ben Badis"]
  },
  {
    code: "09",
    nameFR: "Blida",
    nameAR: "البليدة",
    homePrice: 450,
    deskPrice: 300,
    communes: ["Blida", "Boufarik", "Ouled Yaïch", "Larbaa", "Mouzaia", "El Affroun", "Beni Mered", "Chebli", "Bougara", "Chiffa"]
  },
  {
    code: "19",
    nameFR: "Sétif",
    nameAR: "سطيف",
    homePrice: 600,
    deskPrice: 400,
    communes: ["Sétif", "El Eulma", "Ain Arnat", "Bouandas", "Aïn Azel", "Aïn Oulmene", "Aït Naoual Kada", "Amoucha", "Babor", "Salah Bey"]
  },
  {
    code: "15",
    nameFR: "Tizi Ouzou",
    nameAR: "تيزي وزو",
    homePrice: 550,
    deskPrice: 350,
    communes: ["Tizi Ouzou", "Azazga", "Larbaa Nath Irathen", "Draa El Mizan", "Boghni", "Tigzirt", "Azeffoun", "Bouzeguene"]
  },
  {
    code: "35",
    nameFR: "Boumerdès",
    nameAR: "بومرداس",
    homePrice: 450,
    deskPrice: 300,
    communes: ["Boumerdès", "Boudouaou", "Dellys", "Khemis El Khechna", "Corso", "Figuier", "Naciria", "Isser", "Zemmouri"]
  },
  {
    code: "23",
    nameFR: "Annaba",
    nameAR: "عنابة",
    homePrice: 600,
    deskPrice: 400,
    communes: ["Annaba", "El Bouni", "Sidi Amar", "Berrahal", "El Hadjar", "Seraïdi", "Chetaïbi"]
  },
  {
    code: "06",
    nameFR: "Béjaïa",
    nameAR: "بجاية",
    homePrice: 600,
    deskPrice: 400,
    communes: ["Béjaïa", "Akbou", "Amizour", "El Kseur", "Sidi Aïch", "Tichy", "Souk El Ténine", "Adekar", "Aokas"]
  },
  {
    code: "13",
    nameFR: "Tlemcen",
    nameAR: "تلمسان",
    homePrice: 650,
    deskPrice: 450,
    communes: ["Tlemcen", "Maghnia", "Ghazaouet", "Sebdou", "Remchi", "Mansourah", "Nedroma", "Hennaya", "Ouled Mimoun"]
  },
  {
    code: "30",
    nameFR: "Ouargla",
    nameAR: "ورقلة",
    homePrice: 750,
    deskPrice: 500,
    communes: ["Ouargla", "Hassi Messaoud", "Touggourt", "Rouissat", "N'Goussa", "Sidi Khouiled"]
  },
  {
    code: "47",
    nameFR: "Ghardaïa",
    nameAR: "غرداية",
    homePrice: 750,
    deskPrice: 500,
    communes: ["Ghardaïa", "Metlili", "El Guerrara", "Bounoura", "Dhayet Bendhahoua", "Zelfana"]
  }
];
