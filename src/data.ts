import { Product, Category, Wilaya } from "./types";

export const translations = {
  fr: {
    logo: "TIKATKOM",
    shippingPill: "YLD 🚚",
    shippingTitle: "Livraison Sécurisée via Yalidine Express",
    shippingDesc: "Livraison ultra-rapide sur les 58 Wilayas d'Algérie. Option de livraison à domicile ou retrait directement dans l'un des bureaux officiels Yalidine.",
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
    submitOrder: "Confirmer ma Commande (Paiement à la livraison)",
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
    shippingPill: "YLD 🚚",
    shippingTitle: "شحن آمن وسريع عبر ياليدين إكسبريس",
    shippingDesc: "توصيل سريع وآمن إلى جميع ولايات الوطن (58 ولاية). يمكنك اختيار التوصيل لباب المنزل مباشرة أو استلام الطرد بنفسك من مكتب ياليدين الأقرب إليك.",
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
        desc: "شحن سريع عبر ياليدين إكسبريس إلى جميع ولايات الوطن بأسعار مخفضة."
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
    formDesk: "الاستلام من مكتب ياليدين إكسبريس",
    formQty: "الكمية المطلوبة",
    formNotes: "ملاحظات إضافية (مثال: وقت التوصيل المفضل، معلم قرب البيت)",
    formNotesPlaceholder: "مثال: يرجى الاتصال بي قبل القدوم...",
    
    orderSummary: "ملخص الطلب الخاص بك",
    subtotal: "المجموع الفرعي",
    shippingFee: "مصاريف التوصيل",
    grandTotal: "المجموع الإجمالي للدفع",
    submitOrder: "تأكيد الطلب الآن (الدفع عند الاستلام)",
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
