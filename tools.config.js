// Free photo tools. Each entry becomes /tools/<slug>/ with the shared browser
// engine (static/tool-engine.js). Nothing is uploaded: all processing happens
// on the visitor's phone or computer.
// Fields: slug, group, name (card label), h1, seoTitle (≤ 65 chars), description
// (120–160 chars), keywords, mode, opts, intro, steps[], table {head, rows}?,
// faq[{q,a}], related[slugs].
// Size presets are generic. Exams and forms change their rules, so the pages
// always tell people to check the size in their own notification.

const privacyFaq = { q: "क्या मेरी फोटो किसी सर्वर पर अपलोड होती है?", a: "नहीं। यह टूल पूरी तरह आपके ब्राउज़र में चलता है। फोटो आपके फोन या कंप्यूटर से बाहर नहीं जाती, इसलिए आधार, मार्कशीट या सिग्नेचर जैसी फ़ाइलें भी सुरक्षित रहती हैं।" };
const kbFaq = { q: "साइज़ थोड़ा अलग क्यों दिखता है?", a: "कुछ वेबसाइट 1 KB = 1000 बाइट मानती हैं और कुछ 1024 बाइट। यह टूल ज़्यादा से ज़्यादा वाली लिमिट 1000 बाइट से और कम से कम वाली 1024 बाइट से गिनता है, ताकि फ़ाइल दोनों तरह के फॉर्म में पास हो जाए।" };

function compressTool(n, extra) {
  return {
    slug: `compress-image-to-${n}kb`,
    group: "size",
    name: `फोटो ${n}KB में करें`,
    h1: `Compress Image to ${n}KB — फोटो को ${n}KB में कैसे करें (फ्री)`,
    seoTitle: `Compress Image to ${n}KB Online Free – फोटो ${n}KB में करें`,
    description: `किसी भी फोटो को ${n}KB या उससे कम में बदलें — फ्री, बिना ऐप, बिना अपलोड। मोबाइल पर सरकारी फॉर्म, नौकरी और एडमिशन के लिए JPG तुरंत तैयार।`,
    keywords: `compress image to ${n}kb, image ${n}kb, photo ${n}kb me kaise kare, फोटो ${n}kb में कैसे करें, reduce image size to ${n}kb, jpg ${n}kb`,
    mode: "compress",
    opts: { maxKB: n },
    intro: `ऑनलाइन फॉर्म में "फोटो ${n}KB से कम होनी चाहिए" लिखा है? फोटो चुनें — टूल अपने-आप सबसे अच्छी क्वालिटी पर ${n}KB से छोटी JPG बना देगा। ज़रूरत हो तो ऊपर वाले बॉक्स में KB बदल भी सकते हैं।`,
    steps: ["<b>फोटो चुनें</b> बटन दबाकर गैलरी या कैमरा से फोटो लें।", `टूल तुरंत ${n}KB से छोटी फोटो बना देगा — साइज़ और पिक्सल नीचे दिखेंगे।`, "<b>डाउनलोड करें</b> दबाएं और वही फ़ाइल फॉर्म में अपलोड करें।"],
    faq: [
      { q: `फोटो ${n}KB से कम करने पर क्वालिटी खराब होगी?`, a: `टूल पहले सिर्फ़ JPG क्वालिटी कम करता है और ज़रूरत पड़ने पर ही चौड़ाई-ऊंचाई घटाता है। ${n}KB में आम तौर पर चेहरा और अक्षर साफ़ रहते हैं। अगर फॉर्म में पिक्सल भी तय हैं, तो <a href='/tools/resize-image-in-pixels/'>पिक्सल रीसाइज़ टूल</a> से पहले साइज़ सेट करें।` },
      { q: "फॉर्म में कम से कम KB भी लिखा है, तो?", a: "अगर लिखा है कि फोटो 20KB से 50KB के बीच हो, तो <a href='/tools/increase-image-size-in-kb/'>KB बढ़ाने वाले टूल</a> में दोनों लिमिट डालें — वह फ़ाइल को ठीक उसी रेंज में ले आएगा।" },
      kbFaq,
      privacyFaq,
      ...(extra || [])
    ],
    related: ["increase-image-size-in-kb", "resize-photo-3-5x4-5-cm", "signature-resize", "photo-size-kam-kare"]
  };
}

module.exports = {
  groups: [
    { slug: "size", name: "फोटो का साइज़ (KB) कम या ज़्यादा करें" },
    { slug: "form", name: "फॉर्म के लिए फोटो और सिग्नेचर" },
    { slug: "resize", name: "रीसाइज़, क्रॉप और DPI" },
    { slug: "convert", name: "फ़ॉर्मेट बदलें और PDF बनाएं" }
  ],
  tools: [
    compressTool(20),
    compressTool(50),
    compressTool(100),
    {
      slug: "photo-size-kam-kare",
      group: "size",
      name: "फोटो का साइज़ KB में कम करें",
      h1: "Photo Size Kam Kaise Kare — अपनी पसंद के KB में फोटो छोटी करें",
      seoTitle: "Photo Size Kam Kare – Image Compressor in KB (Free)",
      description: "फोटो का साइज़ KB में कम करें — 10KB, 30KB, 200KB या जितना चाहिए। फ्री इमेज कंप्रेसर, मोबाइल पर चलता है और फोटो कहीं अपलोड नहीं होती।",
      keywords: "photo size kam kaise kare, image compressor in kb, फोटो का साइज़ कम कैसे करें, reduce photo size in kb, image size reducer",
      mode: "compress",
      opts: { maxKB: 30 },
      intro: "जितने KB चाहिए, वह संख्या बॉक्स में लिखें और फोटो चुनें। टूल उतने KB से छोटी, सबसे अच्छी क्वालिटी वाली JPG बना देगा।",
      steps: ["ऊपर <b>ज़्यादा से ज़्यादा साइज़ (KB)</b> में अपनी लिमिट लिखें, जैसे 30।", "<b>फोटो चुनें</b> — नतीजा तुरंत दिखेगा।", "KB बदलेंगे तो फोटो दोबारा बन जाएगी। सही लगे तो <b>डाउनलोड करें</b>।"],
      faq: [{ q: "PNG फोटो का क्या होगा?", a: "छोटा साइज़ पाने के लिए आउटपुट हमेशा JPG होता है। पारदर्शी (transparent) हिस्सा सफ़ेद हो जाता है।" }, kbFaq, privacyFaq],
      related: ["compress-image-to-20kb", "compress-image-to-50kb", "increase-image-size-in-kb", "resize-image-in-pixels"]
    },
    {
      slug: "increase-image-size-in-kb",
      group: "size",
      name: "फोटो का KB बढ़ाएं",
      h1: "Increase Image Size in KB — फोटो का साइज़ KB में बढ़ाएं",
      seoTitle: "Increase Image Size in KB – फोटो का KB बढ़ाएं (Free)",
      description: "फॉर्म कहता है फोटो कम से कम 20KB या 50KB हो? फोटो का साइज़ KB में बढ़ाएं — पिक्सल वही रहते हैं। फ्री, मोबाइल पर, बिना अपलोड।",
      keywords: "increase image size in kb, photo ka size kaise badhaye, फोटो का साइज़ KB में कैसे बढ़ाएं, image size increase 20kb, increase jpg size",
      mode: "increase",
      opts: { minKB: 20, maxKB: 50 },
      intro: "कई फॉर्म बहुत छोटी फ़ाइल को भी रिजेक्ट कर देते हैं (जैसे \"20KB से 50KB के बीच\")। यहाँ कम से कम और ज़्यादा से ज़्यादा KB डालें — टूल फोटो की चौड़ाई-ऊंचाई बदले बिना फ़ाइल को उसी रेंज में ले आता है।",
      steps: ["<b>कम से कम KB</b> और (अगर लिखा हो तो) <b>ज़्यादा से ज़्यादा KB</b> भरें।", "<b>फोटो चुनें</b>। टूल पहले क्वालिटी बढ़ाता है, फिर भी कम रहे तो फ़ाइल में खाली डेटा जोड़कर साइज़ पूरा करता है।", "<b>डाउनलोड करें</b> और फॉर्म में अपलोड करें।"],
      faq: [
        { q: "क्या KB बढ़ाने से फोटो ज़्यादा साफ़ हो जाती है?", a: "नहीं। फ़ाइल का साइज़ बढ़ता है, फोटो की असली क्वालिटी उतनी ही रहती है। फॉर्म की शर्त पूरी करने के लिए यह काफ़ी है।" },
        { q: "क्या यह फ़ाइल सरकारी पोर्टल पर चलेगी?", a: "हाँ, यह एक सामान्य JPG फ़ाइल है। जोड़ा गया डेटा JPG के 'comment' हिस्से में जाता है, जिसे हर सॉफ़्टवेयर नज़रअंदाज़ करता है।" },
        kbFaq,
        privacyFaq
      ],
      related: ["compress-image-to-50kb", "resize-photo-3-5x4-5-cm", "signature-resize", "photo-size-kam-kare"]
    },
    {
      slug: "resize-photo-3-5x4-5-cm",
      group: "form",
      name: "फोटो 3.5×4.5 cm में करें",
      h1: "Resize Photo to 3.5×4.5 cm — पासपोर्ट साइज़ फोटो ऑनलाइन बनाएं",
      seoTitle: "Resize Photo 3.5×4.5 cm Online – 413×531 px, 300 DPI",
      description: "फोटो को 3.5×4.5 cm (300 DPI पर 413×531 px) में बदलें। चेहरा फ्रेम में सेट करें, KB लिमिट डालें और JPG डाउनलोड करें — फ्री, मोबाइल पर।",
      keywords: "resize photo 3.5 x 4.5 cm, 3.5*4.5 cm photo, passport size photo 3.5 x 4.5, photo resize in cm, 413x531 photo, फोटो 3.5x4.5 cm",
      mode: "photo",
      opts: {
        file: "photo-3.5x4.5cm",
        presets: [
          { label: "3.5×4.5 cm", w: 35, h: 45, unit: "mm", dpi: 300, showCm: true },
          { label: "3.5×4.5 cm · 20–50 KB", w: 35, h: 45, unit: "mm", dpi: 300, showCm: true, minKB: 20, maxKB: 50 },
          { label: "3.5×4.5 cm · 200 DPI", w: 35, h: 45, unit: "mm", dpi: 200, showCm: true }
        ]
      },
      intro: "3.5×4.5 cm सबसे आम पासपोर्ट साइज़ है। 300 DPI पर यह 413×531 पिक्सल बनता है। फोटो चुनें, उंगली से खींचकर चेहरा बीच में लाएं, ज़रूरत हो तो KB की लिमिट डालें और डाउनलोड करें।",
      steps: ["<b>फोटो चुनें</b> — हल्के रंग की दीवार के सामने ली गई, सामने से साफ़ फोटो सबसे अच्छी रहती है।", "फोटो को <b>खींचकर</b> चेहरा फ्रेम के बीच में लाएं; स्लाइडर से ज़ूम करें। ⟳ से फोटो घुमा सकते हैं।", "फॉर्म में KB लिमिट लिखी हो तो भरें, फिर <b>फोटो बनाएं</b> और <b>डाउनलोड करें</b>।"],
      table: { head: ["साइज़", "300 DPI पर पिक्सल", "200 DPI पर पिक्सल"], rows: [["3.5×4.5 cm", "413×531", "276×354"], ["2.5×3.5 cm", "295×413", "197×276"], ["2×2 inch (5.1×5.1 cm)", "600×600", "400×400"], ["3×4 cm", "354×472", "236×315"]] },
      faq: [
        { q: "3.5×4.5 cm कितने पिक्सल होता है?", a: "300 DPI पर 413×531 पिक्सल और 200 DPI पर लगभग 276×354 पिक्सल। फॉर्म में पिक्सल लिखे हों तो यूनिट में <b>px</b> चुनकर वही संख्या डालें।" },
        { q: "क्या चेहरे के पीछे का बैकग्राउंड सफ़ेद हो जाएगा?", a: "यह टूल बैकग्राउंड नहीं हटाता। सफ़ेद या हल्की दीवार के सामने फोटो लें। ज़ूम कम करने पर बचे हिस्से सफ़ेद भरे जाते हैं।" },
        { q: "प्रिंट के लिए एक पेज पर कई फोटो चाहिए?", a: "<a href='/tools/passport-size-photo-maker/'>पासपोर्ट साइज़ फोटो मेकर</a> में फोटो बनाने के बाद 4×6 इंच या A4 शीट डाउनलोड कर सकते हैं।" },
        privacyFaq
      ],
      related: ["passport-size-photo-maker", "photo-with-name-and-date", "signature-resize", "increase-image-size-in-kb"]
    },
    {
      slug: "passport-size-photo-maker",
      group: "form",
      name: "पासपोर्ट साइज़ फोटो + प्रिंट शीट",
      h1: "Passport Size Photo Maker — फोटो बनाएं और 4×6 / A4 शीट पर प्रिंट करें",
      seoTitle: "Passport Size Photo Maker Online Free – 4×6 & A4 Sheet",
      description: "मोबाइल से पासपोर्ट साइज़ फोटो बनाएं — 3.5×4.5 cm या 2×2 इंच — और 4×6 इंच या A4 प्रिंट शीट एक क्लिक में डाउनलोड करें। फ्री, बिना अपलोड।",
      keywords: "passport size photo maker, passport size photo online, passport photo print sheet, 4x6 passport photo, a4 passport size photo, पासपोर्ट साइज़ फोटो कैसे बनाएं",
      mode: "photo",
      opts: {
        file: "passport-photo",
        sheet: true,
        presets: [
          { label: "3.5×4.5 cm", w: 35, h: 45, unit: "mm", dpi: 300, showCm: true },
          { label: "2×2 inch", w: 2, h: 2, unit: "in", dpi: 300 },
          { label: "2.5×3.5 cm", w: 25, h: 35, unit: "mm", dpi: 300, showCm: true },
          { label: "3×4 cm", w: 30, h: 40, unit: "mm", dpi: 300, showCm: true }
        ]
      },
      intro: "स्टूडियो जाए बिना पासपोर्ट साइज़ फोटो तैयार करें। साइज़ चुनें, चेहरा फ्रेम में सेट करें और डाउनलोड करें। प्रिंट करवाना हो तो उसी फोटो की 4×6 इंच या A4 शीट भी बन जाती है, जिसे किसी भी फोटो शॉप पर प्रिंट करवा सकते हैं।",
      steps: ["ऊपर से <b>साइज़</b> चुनें (आपकी एप्लीकेशन में जो लिखा हो)।", "<b>फोटो चुनें</b> और खींचकर चेहरा बीच में लाएं — सिर के ऊपर थोड़ी जगह छोड़ें।", "<b>फोटो बनाएं</b> दबाएं। सिंगल फोटो डाउनलोड करें या <b>4×6 / A4 शीट</b> बटन से प्रिंट वाली शीट लें।"],
      table: { head: ["शीट", "3.5×4.5 cm फोटो कितनी आती हैं", "कहाँ प्रिंट करें"], rows: [["4×6 इंच", "8", "फोटो लैब / स्टूडियो (फोटो पेपर)"], ["A4", "30", "घर या साइबर कैफ़े का प्रिंटर"]] },
      faq: [
        { q: "पासपोर्ट एप्लीकेशन में कौन-सा साइज़ चाहिए?", a: "अलग-अलग एप्लीकेशन, वीज़ा और फॉर्म अलग साइज़ मांगते हैं। भारत में 3.5×4.5 cm सबसे आम है, जबकि कई वीज़ा 2×2 इंच मांगते हैं। अपनी एप्लीकेशन के निर्देश में लिखा साइज़ ही चुनें।" },
        { q: "प्रिंट करते समय साइज़ सही कैसे आए?", a: "शीट 300 DPI पर बनती है। प्रिंट करते समय 'Actual size' या '100%' चुनें, 'Fit to page' नहीं।" },
        { q: "क्या बैकग्राउंड सफ़ेद कर सकते हैं?", a: "यह टूल बैकग्राउंड नहीं हटाता। सबसे अच्छा नतीजा सफ़ेद या हल्की दीवार के सामने, दिन की रोशनी में ली गई फोटो से आता है।" },
        privacyFaq
      ],
      related: ["resize-photo-3-5x4-5-cm", "photo-with-name-and-date", "signature-resize", "crop-image"]
    },
    {
      slug: "signature-resize",
      group: "form",
      name: "सिग्नेचर रीसाइज़ (फॉर्म के लिए)",
      h1: "Signature Resize for Exam Form — सिग्नेचर का साइज़ और KB सेट करें",
      seoTitle: "Signature Resize Online for Exam Forms – px, cm & KB",
      description: "सरकारी नौकरी और एग्ज़ाम फॉर्म के लिए सिग्नेचर रीसाइज़ करें — पिक्सल या cm में साइज़, KB लिमिट, और सफ़ेद बैकग्राउंड। फ्री, मोबाइल पर, बिना अपलोड।",
      keywords: "signature resize, signature resize for exam form, signature 10 to 20 kb, signature 140x60, sign resize online, सिग्नेचर का साइज़ कैसे कम करें",
      mode: "photo",
      opts: {
        file: "signature",
        clean: true,
        presets: [
          { label: "140×60 px · 10–20 KB", w: 140, h: 60, unit: "px", dpi: 200, minKB: 10, maxKB: 20 },
          { label: "3.5×1.5 cm", w: 35, h: 15, unit: "mm", dpi: 200, showCm: true },
          { label: "4×2 cm", w: 40, h: 20, unit: "mm", dpi: 200, showCm: true },
          { label: "6×2 cm", w: 60, h: 20, unit: "mm", dpi: 200, showCm: true }
        ]
      },
      intro: "सफ़ेद कागज़ पर काले या नीले पेन से साइन करें, उसकी फोटो लें और यहाँ चुनें। टूल साइन को फ्रेम में सेट करने, बैकग्राउंड सफ़ेद करने और फॉर्म के साइज़ व KB में लाने का काम एक साथ कर देता है।",
      steps: ["सफ़ेद कागज़ पर साइन करके रोशनी में <b>फोटो लें</b>, फिर यहाँ चुनें।", "ऊपर से साइज़ चुनें या अपने फॉर्म के पिक्सल/cm और KB भरें। साइन को खींचकर फ्रेम में भरें।", "<b>सफ़ाई का लेवल</b> से बैकग्राउंड पूरा सफ़ेद करें, फिर <b>फोटो बनाएं</b> और डाउनलोड करें।"],
      faq: [
        { q: "मेरे फॉर्म के लिए सिग्नेचर का सही साइज़ क्या है?", a: "हर भर्ती का नोटिफिकेशन अपना साइज़ बताता है — कोई पिक्सल में (जैसे 140×60), कोई cm में और साथ में KB की रेंज। नोटिफिकेशन में लिखी संख्याएं ही डालें; ऊपर के बटन सिर्फ़ जल्दी भरने के लिए हैं।" },
        { q: "साइन हल्का या धुंधला आ रहा है?", a: "'सफ़ाई का लेवल' स्लाइडर को थोड़ा दाईं ओर करें। फिर भी हल्का लगे तो मोटे काले पेन से दोबारा साइन करके फोटो लें।" },
        { q: "फोटो और सिग्नेचर एक साथ जोड़ने हैं?", a: "अभी यह टूल सिर्फ़ सिग्नेचर बनाता है। फोटो के लिए <a href='/tools/resize-photo-3-5x4-5-cm/'>3.5×4.5 cm फोटो टूल</a> देखें।" },
        kbFaq,
        privacyFaq
      ],
      related: ["resize-photo-3-5x4-5-cm", "photo-with-name-and-date", "compress-image-to-20kb", "increase-image-size-in-kb"]
    },
    {
      slug: "photo-with-name-and-date",
      group: "form",
      name: "फोटो पर नाम और तारीख लिखें",
      h1: "Photo with Name and Date — फोटो के नीचे नाम और तारीख जोड़ें",
      seoTitle: "Add Name and Date on Photo Online – Exam Form Photo",
      description: "एग्ज़ाम फॉर्म के लिए फोटो के नीचे अपना नाम और फोटो खींचने की तारीख जोड़ें — 3.5×4.5 cm साइज़ और KB लिमिट के साथ। फ्री, मोबाइल पर, बिना अपलोड।",
      keywords: "photo with name and date, name and date on photo, add name and date on photo online, photo par naam aur date kaise likhe, फोटो पर नाम और तारीख",
      mode: "photo",
      opts: {
        file: "photo-name-date",
        caption: true,
        presets: [
          { label: "3.5×4.5 cm · 20–50 KB", w: 35, h: 45, unit: "mm", dpi: 200, showCm: true, minKB: 20, maxKB: 50 },
          { label: "3.5×4.5 cm", w: 35, h: 45, unit: "mm", dpi: 300, showCm: true },
          { label: "200×230 px", w: 200, h: 230, unit: "px", dpi: 200 }
        ]
      },
      intro: "कुछ भर्ती फॉर्म ऐसी फोटो मांगते हैं जिसके नीचे उम्मीदवार का नाम और फोटो खींचने की तारीख लिखी हो। यहाँ फोटो चुनें, नाम और तारीख भरें — टूल नीचे सफ़ेद पट्टी में साफ़ काले अक्षरों में लिख देगा और साइज़ भी सेट कर देगा।",
      steps: ["<b>फोटो चुनें</b> और चेहरा फ्रेम में सेट करें (नीचे की सफ़ेद पट्टी में नाम आएगा)।", "<b>नाम</b> (बड़े अक्षरों में) और <b>फोटो की तारीख</b> भरें — तारीख आज की पहले से भरी है।", "साइज़/KB जांचें, फिर <b>फोटो बनाएं</b> और डाउनलोड करें।"],
      faq: [
        { q: "तारीख कौन-सी डालनी है?", a: "आमतौर पर वह तारीख जिस दिन फोटो खींची गई। कई फॉर्म यह भी शर्त रखते हैं कि फोटो नोटिफिकेशन की तारीख से ज़्यादा पुरानी न हो — अपना नोटिफिकेशन ज़रूर पढ़ें।" },
        { q: "नाम का फ़ॉन्ट छोटा दिख रहा है?", a: "लंबा नाम अपने-आप छोटा हो जाता है ताकि पट्टी में पूरा आए। बड़ा चाहिए तो DPI या पिक्सल बढ़ाएं।" },
        kbFaq,
        privacyFaq
      ],
      related: ["resize-photo-3-5x4-5-cm", "signature-resize", "passport-size-photo-maker", "compress-image-to-50kb"]
    },
    {
      slug: "resize-image-in-cm",
      group: "resize",
      name: "फोटो cm / mm / inch में रीसाइज़",
      h1: "Resize Image in CM — फोटो को सेंटीमीटर, mm या इंच में रीसाइज़ करें",
      seoTitle: "Resize Image in CM, MM or Inch Online (Free, 300 DPI)",
      description: "फोटो को cm, mm या inch में रीसाइज़ करें — DPI के साथ सही प्रिंट साइज़। अनुपात लॉक, KB लिमिट और JPG डाउनलोड। फ्री, मोबाइल पर, बिना अपलोड।",
      keywords: "resize image in cm, image resize in cm, photo resize in cm, resize image in mm, resize image in inches, फोटो cm में कैसे करें",
      mode: "resize",
      opts: { unit: "cm", dpi: 300 },
      intro: "प्रिंट या फॉर्म के लिए फोटो का साइज़ सेंटीमीटर में चाहिए? चौड़ाई-ऊंचाई cm में लिखें, DPI चुनें (प्रिंट के लिए 300), और टूल सही पिक्सल में फोटो बना देगा।",
      steps: ["<b>फोटो चुनें</b> — उसका मौजूदा साइज़ cm में दिख जाएगा।", "नई <b>चौड़ाई या ऊंचाई</b> लिखें। अनुपात लॉक रहने पर दूसरी संख्या अपने-आप बदलेगी।", "<b>रीसाइज़ करें</b> और डाउनलोड करें।"],
      table: { head: ["cm", "300 DPI पर px", "200 DPI पर px"], rows: [["1 cm", "118", "79"], ["2.5 cm", "295", "197"], ["5 cm", "591", "394"], ["10 cm", "1181", "787"]] },
      faq: [
        { q: "cm से पिक्सल कैसे निकालें?", a: "पिक्सल = (cm ÷ 2.54) × DPI। जैसे 300 DPI पर 3.5 cm = 413 पिक्सल।" },
        { q: "चेहरा काटकर ठीक साइज़ चाहिए?", a: "अगर चौड़ाई और ऊंचाई दोनों तय हैं (जैसे 3.5×4.5 cm), तो <a href='/tools/resize-photo-3-5x4-5-cm/'>3.5×4.5 cm टूल</a> इस्तेमाल करें — उसमें फोटो को फ्रेम में खिसका सकते हैं।" },
        privacyFaq
      ],
      related: ["resize-image-in-pixels", "resize-photo-3-5x4-5-cm", "change-dpi-to-300", "crop-image"]
    },
    {
      slug: "resize-image-in-pixels",
      group: "resize",
      name: "फोटो पिक्सल में रीसाइज़",
      h1: "Resize Image in Pixels — फोटो की चौड़ाई-ऊंचाई पिक्सल में बदलें",
      seoTitle: "Resize Image in Pixels Online Free – Width × Height",
      description: "फोटो को किसी भी पिक्सल साइज़ में रीसाइज़ करें — जैसे 200×230, 600×600 या 1080×1080। अनुपात लॉक, KB लिमिट, फ्री और बिना अपलोड।",
      keywords: "resize image in pixels, image resize pixel, photo resize 200x230, resize image 600x600, फोटो पिक्सल में कैसे करें",
      mode: "resize",
      opts: { unit: "px" },
      intro: "फॉर्म में लिखा है \"फोटो 200×230 पिक्सल\"? या Instagram के लिए 1080 चौड़ी फोटो चाहिए? पिक्सल में चौड़ाई-ऊंचाई डालें और डाउनलोड करें।",
      steps: ["<b>फोटो चुनें</b> — मौजूदा पिक्सल दिख जाएंगे।", "नई <b>चौड़ाई/ऊंचाई</b> लिखें। सटीक दोनों संख्या चाहिए तो 'अनुपात लॉक' हटा दें।", "KB लिमिट हो तो भरें, फिर <b>रीसाइज़ करें</b>।"],
      faq: [
        { q: "अनुपात लॉक हटाने पर फोटो खिंच जाएगी?", a: "हाँ, अगर नया अनुपात पुराने से अलग है। खिंचाव से बचना है तो <a href='/tools/crop-image/'>क्रॉप टूल</a> या <a href='/tools/resize-photo-3-5x4-5-cm/'>फॉर्म फोटो टूल</a> (px यूनिट चुनकर) इस्तेमाल करें।" },
        kbFaq,
        privacyFaq
      ],
      related: ["resize-image-in-cm", "crop-image", "photo-size-kam-kare", "compress-image-to-50kb"]
    },
    {
      slug: "change-dpi-to-300",
      group: "resize",
      name: "फोटो का DPI 300 करें",
      h1: "Change DPI of Image to 300 — फोटो का DPI बदलें (क्वालिटी वही)",
      seoTitle: "Change Image DPI to 300 Online Free – JPG DPI Converter",
      description: "JPG फोटो का DPI 300 (या कोई भी) करें — पिक्सल और क्वालिटी वही रहती है। प्रिंट और फॉर्म के लिए फ्री DPI चेंजर, मोबाइल पर, बिना अपलोड।",
      keywords: "change dpi to 300, image dpi converter, 300 dpi photo, change dpi of image, फोटो का dpi कैसे बदलें, jpg 300 dpi",
      mode: "dpi",
      opts: { dpi: 300 },
      intro: "DPI फ़ाइल के अंदर लिखी एक जानकारी है जो प्रिंटर को बताती है कि फोटो कितनी बड़ी छपे। यह टूल JPG के पिक्सल को छुए बिना DPI बदल देता है, इसलिए क्वालिटी ज़रा भी कम नहीं होती।",
      steps: ["<b>फोटो चुनें</b> (JPG सबसे अच्छा; PNG/WEBP पहले JPG में बदली जाएगी)।", "<b>नया DPI</b> लिखें — प्रिंट के लिए 300 आम है।", "<b>DPI बदलें</b> और डाउनलोड करें। प्रिंट साइज़ cm में भी दिखेगा।"],
      faq: [
        { q: "क्या DPI बढ़ाने से फोटो साफ़ हो जाती है?", a: "नहीं। DPI सिर्फ़ प्रिंट साइज़ तय करता है। ज़्यादा DPI = वही पिक्सल छोटे कागज़ पर, इसलिए प्रिंट ज़्यादा शार्प दिखता है, पर फोटो में नई डिटेल नहीं आती।" },
        { q: "फॉर्म पिक्सल और DPI दोनों मांगता है?", a: "<a href='/tools/resize-image-in-cm/'>cm रीसाइज़ टूल</a> में साइज़ और DPI दोनों एक साथ सेट हो जाते हैं।" },
        privacyFaq
      ],
      related: ["resize-image-in-cm", "resize-photo-3-5x4-5-cm", "resize-image-in-pixels", "jpg-to-png"]
    },
    {
      slug: "crop-image",
      group: "resize",
      name: "फोटो क्रॉप करें",
      h1: "Crop Image Online — फोटो को 1:1, 4:5, 16:9 या 9:16 में क्रॉप करें",
      seoTitle: "Crop Image Online Free – 1:1, 4:5, 16:9, 9:16 (Mobile)",
      description: "फोटो को Instagram पोस्ट (1:1, 4:5), स्टोरी/रील (9:16) या YouTube थंबनेल (16:9) के लिए क्रॉप करें। फ्री, मोबाइल पर, फोटो कहीं अपलोड नहीं होती।",
      keywords: "crop image online, photo crop, crop image 1:1, crop photo for instagram, 16:9 crop, फोटो क्रॉप कैसे करें",
      mode: "crop",
      opts: {},
      intro: "अनुपात चुनें, फोटो को खींचकर सही हिस्सा फ्रेम में लाएं और क्रॉप करें। फोटो अपनी असली क्वालिटी में ही कटती है।",
      steps: ["<b>फोटो चुनें</b>।", "ऊपर से <b>अनुपात</b> चुनें — 1:1 (DP/पोस्ट), 4:5 (Instagram), 9:16 (स्टोरी/रील), 16:9 (YouTube)।", "खींचकर और ज़ूम करके हिस्सा सेट करें, फिर <b>क्रॉप करें</b>।"],
      faq: [{ q: "क्रॉप करने से क्वालिटी कम होती है?", a: "नहीं, चुना हुआ हिस्सा असली रिज़ॉल्यूशन में ही सेव होता है (बहुत बड़ी फोटो 4000 पिक्सल तक छोटी की जाती है)।" }, privacyFaq],
      related: ["resize-image-in-pixels", "passport-size-photo-maker", "photo-size-kam-kare", "jpg-to-pdf"]
    },
    {
      slug: "jpg-to-pdf",
      group: "convert",
      name: "JPG से PDF बनाएं",
      h1: "JPG to PDF — कई फोटो से एक PDF बनाएं (फ्री, मोबाइल पर)",
      seoTitle: "JPG to PDF Converter Free – Multiple Photos to One PDF",
      description: "मार्कशीट, आधार या डॉक्यूमेंट की कई फोटो से एक PDF बनाएं — क्रम बदलें, A4 पेज, कम साइज़। फ्री, मोबाइल पर, फोटो कहीं अपलोड नहीं होती।",
      keywords: "jpg to pdf, image to pdf, photo to pdf, multiple jpg to pdf, फोटो से pdf कैसे बनाएं, jpg to pdf converter free",
      mode: "pdf",
      opts: {},
      intro: "डॉक्यूमेंट के पन्नों की फोटो खींचें और यहाँ चुनें। क्रम ऊपर-नीचे करें, पेज साइज़ चुनें और एक PDF डाउनलोड करें। आधार या मार्कशीट जैसे निजी डॉक्यूमेंट भी सुरक्षित — फ़ाइल आपके फोन में ही बनती है।",
      steps: ["<b>फोटो चुनें</b> — एक साथ कई फोटो चुन सकते हैं, बाद में और जोड़ भी सकते हैं।", "↑ ↓ से <b>क्रम</b> ठीक करें, ✕ से हटाएं।", "पेज साइज़ और क्वालिटी चुनें, फिर <b>PDF बनाएं</b>।"],
      faq: [
        { q: "PDF का साइज़ बहुत बड़ा है?", a: "क्वालिटी में 'कम साइज़' चुनें। फॉर्म में PDF की KB लिमिट बहुत कम हो तो पहले फोटो को <a href='/tools/photo-size-kam-kare/'>छोटा करें</a>, फिर PDF बनाएं।" },
        { q: "कितनी फोटो जोड़ सकते हैं?", a: "कोई तय लिमिट नहीं है, पर पुराने फोन पर 30–40 से ज़्यादा फोटो में समय लग सकता है।" },
        privacyFaq
      ],
      related: ["photo-size-kam-kare", "png-to-jpg", "crop-image", "compress-image-to-100kb"]
    },
    {
      slug: "png-to-jpg",
      group: "convert",
      name: "PNG से JPG",
      h1: "PNG to JPG Converter — PNG फोटो को JPG में बदलें",
      seoTitle: "PNG to JPG Converter Online Free – No Upload",
      description: "PNG फोटो या स्क्रीनशॉट को JPG में बदलें — पारदर्शी हिस्सा सफ़ेद, फ़ाइल छोटी। फॉर्म और WhatsApp के लिए फ्री, मोबाइल पर, बिना अपलोड।",
      keywords: "png to jpg, png to jpg converter, convert png to jpg, png ko jpg kaise kare, पीएनजी को जेपीजी",
      mode: "convert",
      opts: { to: "image/jpeg", accept: "image/png,image/*" },
      intro: "कई फॉर्म सिर्फ़ JPG/JPEG मांगते हैं। PNG चुनें — टूल तुरंत JPG बना देगा।",
      steps: ["<b>PNG फोटो चुनें</b>।", "JPG अपने-आप बन जाएगी।", "<b>डाउनलोड करें</b>।"],
      faq: [{ q: "JPG और JPEG में फ़र्क है?", a: "नहीं, दोनों एक ही फ़ॉर्मेट के नाम हैं। जहाँ JPEG मांगा हो, वहाँ .jpg फ़ाइल चल जाती है।" }, privacyFaq],
      related: ["jpg-to-png", "webp-to-jpg", "photo-size-kam-kare", "jpg-to-pdf"]
    },
    {
      slug: "jpg-to-png",
      group: "convert",
      name: "JPG से PNG",
      h1: "JPG to PNG Converter — JPG फोटो को PNG में बदलें",
      seoTitle: "JPG to PNG Converter Online Free – No Upload",
      description: "JPG या JPEG फोटो को PNG में बदलें — बिना क्वालिटी खोए। फ्री ऑनलाइन कन्वर्टर, मोबाइल पर चलता है, फोटो कहीं अपलोड नहीं होती।",
      keywords: "jpg to png, jpg to png converter, jpeg to png, jpg ko png kaise kare, जेपीजी को पीएनजी",
      mode: "convert",
      opts: { to: "image/png", accept: "image/jpeg,image/*" },
      intro: "JPG चुनें और PNG डाउनलोड करें। PNG में आगे एडिट करने पर क्वालिटी बार-बार नहीं घटती।",
      steps: ["<b>JPG फोटो चुनें</b>।", "PNG अपने-आप बन जाएगी।", "<b>डाउनलोड करें</b>।"],
      faq: [{ q: "PNG का साइज़ JPG से बड़ा क्यों है?", a: "PNG हर पिक्सल बिना कंप्रेशन के रखता है, इसलिए फ़ाइल बड़ी होती है। छोटी फ़ाइल चाहिए तो JPG ही रखें।" }, privacyFaq],
      related: ["png-to-jpg", "webp-to-jpg", "crop-image", "change-dpi-to-300"]
    },
    {
      slug: "webp-to-jpg",
      group: "convert",
      name: "WEBP से JPG",
      h1: "WEBP to JPG Converter — WEBP फोटो को JPG में बदलें",
      seoTitle: "WEBP to JPG Converter Online Free – No Upload",
      description: "वेबसाइट से सेव हुई WEBP फोटो को JPG में बदलें ताकि वह हर ऐप और फॉर्म में खुले। फ्री, मोबाइल पर, फोटो कहीं अपलोड नहीं होती।",
      keywords: "webp to jpg, webp to jpg converter, convert webp to jpg, webp ko jpg kaise kare, webp to jpeg",
      mode: "convert",
      opts: { to: "image/jpeg", accept: "image/webp,image/*" },
      intro: "कई बार गूगल या वेबसाइट से सेव की गई फोटो .webp बनती है, जो कुछ ऐप और फॉर्म में नहीं खुलती। यहाँ चुनें और JPG डाउनलोड करें।",
      steps: ["<b>WEBP फोटो चुनें</b>।", "JPG अपने-आप बन जाएगी।", "<b>डाउनलोड करें</b>।"],
      faq: [{ q: "किसी और की फोटो इस्तेमाल कर सकते हैं?", a: "फ़ॉर्मेट बदलने से कॉपीराइट नहीं बदलता। इंटरनेट की फोटो सिर्फ़ तभी इस्तेमाल करें जब उसकी इजाज़त हो।" }, privacyFaq],
      related: ["png-to-jpg", "jpg-to-png", "photo-size-kam-kare", "jpg-to-pdf"]
    }
  ]
};
