/* ==========================================================================
   Salt Restaurant | Terrace & Bar — Multi-Page React + Tailwind Application
   Routes:
     #/                 -> HomePage (მთავარი)
     #/menu             -> MenuPage (მენიუ & Liquid Art ბარი)
     #/terrace-events   -> TerraceEventsPage (ტერასა, ლაივ მუსიკა & ივენთები)
     #/gallery          -> GalleryPage (ვიზუალური გალერეა & Lightbox)
     #/reserve          -> ReserveContactPage (მაგიდის დაჯავშნა & Google Maps)
   ========================================================================== */

(function () {
  /* Built-in fallback React-compatible runtime if offline / CDN blocked */
  if (!window.React || !window.ReactDOM) {
    let hooks = [];
    let hookIdx = 0;
    let rootRender = null;

    const createElement = (type, props, ...children) => {
      const flat = [];
      const pushChild = (c) => {
        if (Array.isArray(c)) c.forEach(pushChild);
        else if (c !== null && c !== undefined && c !== false && c !== true) flat.push(c);
      };
      children.forEach(pushChild);
      return { type, props: { ...(props || {}), children: flat } };
    };

    const useState = (init) => {
      const idx = hookIdx++;
      if (hooks[idx] === undefined) {
        hooks[idx] = typeof init === "function" ? init() : init;
      }
      const setState = (val) => {
        const next = typeof val === "function" ? val(hooks[idx]) : val;
        if (next !== hooks[idx]) {
          hooks[idx] = next;
          if (rootRender) rootRender();
        }
      };
      return [hooks[idx], setState];
    };

    const useEffect = (fn, deps) => {
      const idx = hookIdx++;
      const prev = hooks[idx];
      const changed =
        !prev || !deps || deps.some((d, i) => d !== prev.deps[i]);
      if (changed) {
        hooks[idx] = { deps };
        setTimeout(() => fn(), 0);
      }
    };

    const useMemo = (fn) => fn();

    const toDom = (vnode) => {
      if (typeof vnode === "string" || typeof vnode === "number") {
        return document.createTextNode(String(vnode));
      }
      if (!vnode) return document.createTextNode("");
      if (typeof vnode.type === "function") {
        return toDom(vnode.type(vnode.props || {}));
      }
      const el = document.createElement(vnode.type);
      const props = vnode.props || {};
      Object.keys(props).forEach((k) => {
        if (k === "children" || k === "key") return;
        const v = props[k];
        if (k === "className") el.className = v || "";
        else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
        else if (k === "htmlFor") el.setAttribute("for", v);
        else if (k.startsWith("on") && typeof v === "function") {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === "checked" || k === "value" || k === "disabled" || k === "selected") {
          el[k] = v;
        } else if (v !== undefined && v !== null && v !== false) {
          el.setAttribute(k, String(v));
        }
      });
      (props.children || []).forEach((c) => el.appendChild(toDom(c)));
      return el;
    };

    window.React = { createElement, useState, useEffect, useMemo, Fragment: "div" };
    window.ReactDOM = {
      createRoot: (container) => ({
        render: (vnode) => {
          rootRender = () => {
            hookIdx = 0;
            container.innerHTML = "";
            container.appendChild(toDom(vnode));
          };
          rootRender();
        }
      })
    };
  }

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const h = React.createElement;
  const { useState, useEffect, useMemo } = React;

  /* ========================================================================
     1. RESTAURANT DATA (Salt Restaurant | Terrace & Bar, Tbilisi)
     ======================================================================== */
  const RESTAURANT_INFO = {
    name: "SALT",
    subtitle: "Restaurant • Terrace & Bar",
    googleMapsUrl: "https://maps.app.goo.gl/xgSYewt5Cb7jUTFT8",
    googleMapsEmbed:
      "https://maps.google.com/maps?q=11%20Giorgi%20Saakadze%20Descent%2C%20Tbilisi&t=&z=15&ie=UTF8&iwloc=&output=embed",
    instagramUrl: "https://www.instagram.com/salt_restaurant_",
    facebookUrl: "https://www.facebook.com/saltrestauranttbilisi",
    phone: "+995 595 33 55 33",
    phoneRaw: "+995595335533",
    email: "Info@SaltRestaurant.ge",
    rating: "4.2",
    avgSpend: "₾50–₾60",
    hours: "12:00 – 01:00"
  };

  const MENU_ITEMS = [
    {
      id: "adjarian-khachapuri",
      category: "georgian",
      price: 26,
      image: "assets/georgian-feast.jpg",
      featured: true,
      dietary: ["vegetarian", "signature"],
      tagKa: "შეფის რჩეული",
      tagEn: "Chef's Pick",
      nameKa: "აჭარული ხაჭაპური კარაქითა და კვერცხით",
      nameEn: "Artisanal Adjarian Khachapuri",
      descKa: "ნავის ფორმის ხრაშუნა ცომი, იმერული და სულგუნის ყველის ბლენდით, მთის კარაქითა და სოფლის კვერცხის გულით.",
      descEn: "Crisp boat-shaped dough filled with bubbling Imeretian and Sulguni cheeses, topped with farm egg yolk and mountain butter.",
      pairingKa: "საუკეთესოა ქვევრის ქარვისფერ ღვინოსთან (რქაწითელი)",
      pairingEn: "Pairs with Qvevri Amber Rkatsiteli",
      weight: "420 გ / g"
    },
    {
      id: "shkmeruli-clay",
      category: "georgian",
      price: 32,
      image: "assets/georgian-feast.jpg",
      featured: true,
      dietary: ["signature", "shareable"],
      tagKa: "კლასიკა",
      tagEn: "Heritage Classic",
      nameKa: "შქმერული კეცზე ნაღებისა და ნივრის სოუსში",
      nameEn: "Pan-Roasted Shkmeruli on Clay Ketsi",
      descKa: "ოქროსფრად შემწვარი წიწილა კეცზე, მოთუშული ახალი ნივრის, ნაღებისა და მთის ქონდრის ხავერდოვან სოუსში.",
      descEn: "Golden pan-seared spring chicken served sizzling in a velvety roasted garlic, double cream, and mountain savory reduction.",
      pairingKa: "საუკეთესოა წინანდალთან",
      pairingEn: "Pairs with Tsinandali Dry White",
      weight: "480 გ / g"
    },
    {
      id: "pkhali-board",
      category: "georgian",
      price: 24,
      image: "assets/salad-appetizer.jpg",
      featured: false,
      dietary: ["vegetarian", "shareable"],
      tagKa: "გასაზიარებელი",
      tagEn: "To Share",
      nameKa: "ფხალის ასორტი და ცხელი მჭადები",
      nameEn: "Georgian Pkhali Trio & Warm Mchadi",
      descKa: "ისპანახის, ჭარხლისა და ბადრიჯნის ხელნაკეთი ფხალეული კახური ნიგვზის საკმაზით, ბროწეულითა და ცხელი მჭადით.",
      descEn: "Spinach, roasted beetroot, and seared eggplant rolls crafted with toasted Kakhetian walnuts, pomegranate, and warm cornbread.",
      pairingKa: "საუკეთესოა კისისთან ან საფერავთან",
      pairingEn: "Pairs with Kisi or Saperavi",
      weight: "360 გ / g"
    },
    {
      id: "eggplant-walnut-tomato",
      category: "georgian",
      price: 22,
      image: "assets/georgian-feast.jpg",
      featured: false,
      dietary: ["vegetarian"],
      tagKa: "საფირმო",
      tagEn: "House Recipe",
      nameKa: "ბადრიჯანი ნიგვზით გამომცხვარი პომიდვრის სოუსში",
      nameEn: "Seared Eggplant with Walnut Paste in Smoked Tomato Jus",
      descKa: "შემწვარი ბადრიჯანი სანელებლებიანი ნიგვზის გულსართით, მორთული პომიდვრის სოუსითა და რეჰანის ზეთით.",
      descEn: "Char-seared eggplant medallions filled with spiced walnut paste, resting on slow-simmered tomato sauce and basil oil.",
      pairingKa: "საუკეთესოა მუკუზანთან",
      pairingEn: "Pairs with Mukuzani",
      weight: "310 გ / g"
    },
    {
      id: "imeretian-lobiani-duo",
      category: "georgian",
      price: 25,
      image: "assets/georgian-feast.jpg",
      featured: false,
      dietary: ["vegetarian", "shareable"],
      tagKa: "ტრადიციული",
      tagEn: "Bakery",
      nameKa: "იმერული ხაჭაპური და რაჭული ლობიანი",
      nameEn: "Imeretian Khachapuri & Spiced Bean Lobiani",
      descKa: "ახლად გამომცხვარი თხელცომიანი იმერული ხაჭაპური და ტრადიციული ლობიანი მწნილის ასორტთან ერთად.",
      descEn: "Thin-crust Imeretian cheese bread and spiced kidney bean lobiani served with house-pickled Jonjoli.",
      pairingKa: "საუკეთესოა ტვიშთან",
      pairingEn: "Pairs with Tvishi Semi-Sweet",
      weight: "450 გ / g"
    },
    {
      id: "arugula-nadughi-salad",
      category: "salads",
      price: 24,
      image: "assets/salad-appetizer.jpg",
      featured: true,
      dietary: ["vegetarian", "signature"],
      tagKa: "საფირმო სტარტერი",
      tagEn: "Signature Starter",
      nameKa: "რუკოლას სალათი ნადუღითა და მოხალული ნიგვზით",
      nameEn: "Wild Arugula Salad with Whipped Nadughi & Walnuts",
      descKa: "ცოცხალი რუკოლა, პიტნით შეზავებული ნაზი ქართული ნადუღი, ფერადი ჩერი პომიდორი, მოხალული ნიგოზი და ბალზამიკოს გლაზური.",
      descEn: "Peppery wild arugula, mint-infused Georgian Nadughi ricotta, heirloom cherry tomatoes, candied walnuts, and aged balsamic.",
      pairingKa: "საუკეთესოა პროსეკოსთან ან მწვანესთან",
      pairingEn: "Pairs with Prosecco or Kakhetian Mtsvane",
      weight: "280 გ / g"
    },
    {
      id: "cured-salmon-citrus",
      category: "salads",
      price: 34,
      image: "assets/salad-appetizer.jpg",
      featured: false,
      dietary: ["signature"],
      tagKa: "ზღვის პროდუქტი",
      tagEn: "Seafood",
      nameKa: "მსუბუქად დამარილებული ორაგული ზღვის მარილითა და ციტრუსით",
      nameEn: "Sea-Salt Cured Salmon Carpaccio with Citrus",
      descKa: "Salt-ის საფირმო რეცეპტით დამარილებული ნორვეგიული ორაგულის თხელი ნაჭრები, გრეიპფრუტის სეგმენტებითა და კამის ემულსიით.",
      descEn: "House sea-salt cured Norwegian salmon fillets dressed with ruby grapefruit, crispy capers, and dill emulsion.",
      pairingKa: "საუკეთესოა შარდონესთან",
      pairingEn: "Pairs with Chardonnay",
      weight: "240 გ / g"
    },
    {
      id: "artisanal-cheese-board",
      category: "salads",
      price: 42,
      image: "assets/salad-appetizer.jpg",
      featured: false,
      dietary: ["vegetarian", "shareable"],
      tagKa: "ტერასის რჩეული",
      tagEn: "Terrace Platter",
      nameKa: "ქართული და ევროპული ყველის დაფა თაფლითა და ჩირებით",
      nameEn: "Artisanal Georgian & European Cheese Board",
      descKa: "დაძველებული გუდა, შებოლილი სულგუნი, საფერავში დავარგებული ყველი, პარმეზანი და ბრი — წაბლის თაფლით, ნიგვზითა და ხილით.",
      descEn: "Saperavi-aged cheese, smoked Sulguni, aged Gudis Kveli, Parmigiano, and Brie served with chestnut honey and nuts.",
      pairingKa: "საუკეთესოა საფერავის რეზერვთან",
      pairingEn: "Pairs with Saperavi Reserve",
      weight: "420 გ / g"
    },
    {
      id: "tomato-cucumber-gurian",
      category: "salads",
      price: 19,
      image: "assets/salad-appetizer.jpg",
      featured: false,
      dietary: ["vegetarian"],
      tagKa: "ფრეშ",
      tagEn: "Garden Fresh",
      nameKa: "კიტრი-პომიდვრის სალათი გურული აჯიკით ან გოგრის პესტოთი",
      nameEn: "Heirloom Tomato & Cucumber Salad with Gurian Adjika",
      descKa: "სურნელოვანი ვარდისფერი პომიდორი და ხრაშუნა კიტრი ნიგვზიანი გურული აჯიკით ან მოხალული გოგრის თესლის პესტოთი.",
      descEn: "Sun-ripened pink tomatoes and crisp cucumbers tossed in fragrant Gurian walnut adjika or pumpkin seed pesto.",
      pairingKa: "საუკეთესოა ცოლიკოურთან",
      pairingEn: "Pairs with Tsolikouri",
      weight: "300 გ / g"
    },
    {
      id: "beef-medallions-saperavi",
      category: "mains",
      price: 46,
      image: "assets/georgian-feast.jpg",
      featured: false,
      dietary: ["signature"],
      tagKa: "შეფის სპეციალი",
      tagEn: "Chef's Signature",
      nameKa: "საქონლის სუკის მედალიონები საფერავისა და ტრიუფელის სოუსით",
      nameEn: "Beef Tenderloin Medallions in Saperavi & Truffle Jus",
      descKa: "გრილზე შემწვარი ნაზი საქონლის სუკი, კარტოფილისა და ტრიუფელის კრემოვანი პიურეთი და საფერავის ღვინის რედუქციით.",
      descEn: "Char-grilled prime beef tenderloin served over silky truffle potato mousseline with a rich Saperavi reduction.",
      pairingKa: "საუკეთესოა მუკუზანთან",
      pairingEn: "Pairs with Mukuzani",
      weight: "340 გ / g"
    },
    {
      id: "spinach-veloute",
      category: "mains",
      price: 18,
      image: "assets/salad-appetizer.jpg",
      featured: false,
      dietary: ["vegetarian"],
      tagKa: "წვნიანი",
      tagEn: "Velouté",
      nameKa: "ისპანახის ხავერდოვანი კრემ-სუპი სულგუნის ჩიფსით",
      nameEn: "Velvety Spinach Cream Soup with Crisp Sulguni",
      descKa: "ახალი ისპანახის, ნაღებისა და მუსკატის კაკლის ნაზი კრემ-სუპი, გამომცხვარი სულგუნის ხრაშუნა ფირფიტით.",
      descEn: "Silky blend of baby spinach, light cream, and nutmeg crowned with a lacy baked Sulguni crisp.",
      pairingKa: "საუკეთესოა დღის ლანჩზე",
      pairingEn: "Ideal for midday lunch",
      weight: "300 მლ / ml"
    },
    {
      id: "business-lunch-set",
      category: "lunch",
      price: 28,
      image: "assets/salad-appetizer.jpg",
      featured: false,
      dietary: ["signature"],
      tagKa: "12:00 – 16:00",
      tagEn: "Weekday Lunch",
      nameKa: "ბიზნეს ლანჩი: ორაგულის კრუასანი ან კოტლეტი პიურეთი + წვნიანი",
      nameEn: "Executive Business Lunch: Salmon Croissant or Artisanal Cutlet Set",
      descKa: "სამუშაო დღეების სპეციალური შეთავაზება მე-7 სართულის ტერასაზე: დღის კრემ-სუპი, ძირითადი კერძი და სასმელი.",
      descEn: "Weekday midday set on the 7th floor: soup of the day, salmon croissant or cutlet with mash, plus beverage.",
      pairingKa: "მოქმედებს ორშაბათიდან პარასკევის ჩათვლით 12:00–16:00",
      pairingEn: "Available Mon–Fri, 12:00–16:00",
      weight: "სრული სეტი / Full Set"
    },
    {
      id: "salt-golden-hour-coupe",
      category: "drinks",
      price: 24,
      image: "assets/signature-cocktail.jpg",
      featured: true,
      dietary: ["signature"],
      tagKa: "Liquid Art",
      tagEn: "Liquid Art",
      nameKa: "Salt Golden Hour (საფირმო კოქტეილი ზღვის მარილის რკალით)",
      nameEn: "Salt Golden Hour Coupe",
      descKa: "დაძველებული ქართული ბრენდი, მანდარინისა და ბერგამოტის კორდიალი, პროსეკო და შებოლილი ზღვის მარილის გვირგვინი.",
      descEn: "Aged Georgian brandy, mandarin and bergamot cordial, dry prosecco float, and a smoked sea-salt citrus rim.",
      pairingKa: "ტერასის მზის ჩასვლის სავიზიტო ბარათი",
      pairingEn: "Signature sunset terrace aperitif",
      weight: "180 მლ / ml"
    },
    {
      id: "mtatsminda-smoked-negroni",
      category: "drinks",
      price: 26,
      image: "assets/signature-cocktail.jpg",
      featured: false,
      dietary: ["signature"],
      tagKa: "ბარმენის რჩეული",
      tagEn: "Mixologist's Pick",
      nameKa: "Rosemary Smoked Old Fashioned",
      nameEn: "Torched Rosemary Bourbon & Saperavi Reduction",
      descKa: "ბურბონი, საფერავის ბითერი, დამწვარი როზმარინის კვამლი და ფორთოხლის ცედრა კრისტალურ ყინულის სფეროზე.",
      descEn: "Small-batch bourbon, house Saperavi wine bitters, and torched rosemary smoke over a crystal ice sphere.",
      pairingKa: "საუკეთესოა საღამოს DJ სეტების დროს",
      pairingEn: "Crafted for nocturnal terrace sessions",
      weight: "150 მლ / ml"
    },
    {
      id: "citrus-mineral-elixir",
      category: "drinks",
      price: 14,
      image: "assets/signature-cocktail.jpg",
      featured: false,
      dietary: ["vegetarian"],
      tagKa: "უალკოჰოლო",
      tagEn: "Zero Proof",
      nameKa: "ციტრუსის ფრეშ-მიქსი, საფირმო ლიმონათი და მინერალური წყლები",
      nameEn: "Artisanal Citrus Lemonade & Georgian Mineral Waters",
      descKa: "ახლად გამოწურული გრეიპფრუტისა და ფორთოხლის მიქსი ტარხუნითა და ჯანჯაფილით, ბორჯომისა და ნაბეღლავის თანხლებით.",
      descEn: "Freshly pressed ruby grapefruit and orange infusion with tarragon and ginger, alongside Borjomi and Nabeglavi.",
      pairingKa: "გამაგრილებელი ნებისმიერ დროს",
      pairingEn: "Refreshing all-day elixir",
      weight: "350 მლ / ml"
    }
  ];

  const TERRACE_EVENTS = [
    {
      id: "friday-skyline-dj",
      dayKa: "ყოველ პარასკევს • 21:00 – 01:00",
      dayEn: "Every Friday • 21:00 – 01:00",
      badgeKa: "TERRACE DJ SET",
      badgeEn: "TERRACE DJ SET",
      titleKa: "Nocturnal Skyline & Melodic House",
      titleEn: "Nocturnal Skyline & Melodic House",
      descKa: "პარასკევ საღამოს მე-7 სართულის ტერასა ივსება Melodic House & Nu-Disco რიტმებით, საავტორო კოქტეილებითა და ღამის თბილისის პანორამული ნათებით.",
      descEn: "Friday nights on the 7th floor come alive with Melodic House & Nu-Disco sets, Liquid Art mixology, and sweeping views of illuminated Tbilisi.",
      zone: "terrace"
    },
    {
      id: "saturday-live-band",
      dayKa: "ყოველ შაბათს • 20:30 – 00:30",
      dayEn: "Every Saturday • 20:30 – 00:30",
      badgeKa: "LIVE MUSIC & VOCALS",
      badgeEn: "LIVE MUSIC & VOCALS",
      titleKa: "ცოცხალი ბენდი, Soul & Jazz Fusion",
      titleEn: "Live Acoustic Band, Soul & Jazz Fusion",
      descKa: "ცოცხალი შესრულება ვოკალისა და საქსოფონის თანხლებით, რომელიც 23:00 საათიდან DJ სეტში გადადის. რეკომენდებულია მაგიდის წინასწარი დაჯავშნა.",
      descEn: "Live vocal and saxophone performances under the stars, transitioning into a late-night lounge DJ set. Advance table reservation recommended.",
      zone: "terrace"
    },
    {
      id: "sunday-sunset-aperitivo",
      dayKa: "ყოველ კვირას • 18:00 – 23:00",
      dayEn: "Every Sunday • 18:00 – 23:00",
      badgeKa: "SUNSET APERITIVO",
      badgeEn: "SUNSET APERITIVO",
      titleKa: "მზის ჩასვლის სესიები და ღვინის დეგუსტაცია",
      titleEn: "Golden Hour Aperitivo & Wine Pairing",
      descKa: "მშვიდი კვირა საღამო მთაწმინდის დაისის ფონზე — ქართული ყველის დაფა, ქვევრის ღვინოები და აკუსტიკური ფონური მუსიკა.",
      descEn: "Unwind as the sun dips behind Mtatsminda — artisanal Georgian cheese platters, curated Qvevri wines, and warm acoustic lounge grooves.",
      zone: "terrace"
    },
    {
      id: "weekday-business-terrace",
      dayKa: "ორშაბათი – პარასკევი • 12:00 – 16:00",
      dayEn: "Monday – Friday • 12:00 – 16:00",
      badgeKa: "EXECUTIVE LUNCH",
      badgeEn: "EXECUTIVE LUNCH",
      titleKa: "ბიზნეს-ლანჩი ღია ტერასაზე",
      titleEn: "Midday Business Lunch Above the City",
      descKa: "სწრაფი და დახვეწილი დღის მენიუ საქმიანი შეხვედრებისთვის სააკაძის დაღმართზე — პანორამული დღის შუქი, სწრაფი სერვისი და მშვიდი ატმოსფერო.",
      descEn: "Refined, prompt midday dining for business meetings at Saakadze Descent — natural daylight, panoramic views, and curated lunch sets.",
      zone: "indoor"
    }
  ];

  const GROUP_PACKAGES = [
    {
      id: "birthday-terrace",
      nameKa: "დაბადების დღისა და წვეულების პაკეტი",
      nameEn: "Terrace Celebration & Birthday Package",
      guestsKa: "6 – 16 სტუმარი",
      guestsEn: "6 – 16 Guests",
      priceKa: "₾55-დან / სტუმარზე",
      priceEn: "From ₾55 / guest",
      featuresKa: [
        "პრიორიტეტული მაგიდა ღია პანორამულ ტერასაზე",
        "ქართულ-ევროპული სადღესასწაულო სუფრა (ხაჭაპური, შქმერული, ყველის დაფა, სალათები)",
        "მისასალმებელი Signature კოქტეილი ან ქართული ღვინო",
        "სადღესასწაულო დესერტის სერვირება ცოცხალი მუსიკის ფონზე"
      ],
      featuresEn: [
        "Priority panoramic edge table on the 7th-floor terrace",
        "Curated Georgian-European sharing feast",
        "Welcome Signature Cocktail or bottle of Georgian wine",
        "Celebratory dessert presentation during live music"
      ]
    },
    {
      id: "corporate-reception",
      nameKa: "კორპორატიული საღამო & Private Rooftop",
      nameEn: "Corporate Dinner & Private Lounge",
      guestsKa: "15 – 50 სტუმარი",
      guestsEn: "15 – 50 Guests",
      priceKa: "ინდივიდუალური შეთავაზება",
      priceEn: "Custom Tailored Menu",
      featuresKa: [
        "დარბაზის ან ტერასის სექტორის სრული დაჯავშნა",
        "ფურშეტის ან სრული ვახშმის მენიუ შეფ-მზარეულისგან",
        "პერსონალური ბარმენი და Liquid Art კოქტეილ-ბარი",
        "აუდიო სისტემა, DJ და ფოტოგრაფირების ზონა თბილისის ხედით"
      ],
      featuresEn: [
        "Exclusive zone buyout of terrace or indoor marble lounge",
        "Bespoke seated dinner or standing canapé & cocktail reception",
        "Dedicated mixologist station & premium open bar options",
        "Sound system, DJ coordination & panoramic city backdrop"
      ]
    }
  ];

  const GALLERY_ITEMS = [
    {
      id: "gal-terrace-night",
      category: "terrace",
      src: "assets/hero-terrace.jpg",
      span: "wide",
      titleKa: "მე-7 სართულის პანორამული ტერასა ღამით",
      titleEn: "7th-Floor Panoramic Terrace at Night",
      subtitleKa: "ხედი მთაწმინდის ანძაზე, სამებასა და ძველ თბილისზე",
      subtitleEn: "Overlooking Mtatsminda TV Tower, Sameba & Old Tbilisi"
    },
    {
      id: "gal-georgian-feast",
      category: "culinary",
      src: "assets/georgian-feast.jpg",
      span: "normal",
      titleKa: "აჭარული ხაჭაპური და შქმერული კეცზე",
      titleEn: "Adjarian Khachapuri & Clay-Pan Shkmeruli",
      subtitleKa: "ქართული კულინარიული ტრადიცია ბაზალტის სერვირებით",
      subtitleEn: "Georgian culinary heritage served on dark basalt"
    },
    {
      id: "gal-liquid-art",
      category: "bar",
      src: "assets/signature-cocktail.jpg",
      span: "normal",
      titleKa: "Liquid Art — საავტორო მიქსოლოგია",
      titleEn: "Liquid Art — Signature Mixology",
      subtitleKa: "ზღვის მარილის რკალითა და დამწვარი როზმარინის არომატით",
      subtitleEn: "Sea-salt rimmed coupes & torched rosemary aromatics"
    },
    {
      id: "gal-arugula-nadughi",
      category: "culinary",
      src: "assets/salad-appetizer.jpg",
      span: "normal",
      titleKa: "რუკოლას სალათი ნადუღითა და კახური ნიგვზით",
      titleEn: "Wild Arugula with Whipped Nadughi & Walnuts",
      subtitleKa: "მსუბუქი სტარტერი ხელნაკეთ კერამიკაზე",
      subtitleEn: "Fresh seasonal starter on artisanal dark stoneware"
    },
    {
      id: "gal-bar-atmosphere",
      category: "bar",
      src: "assets/signature-cocktail.jpg",
      span: "wide",
      titleKa: "მარმარილოს ბარი და თბილი ქარვისფერი განათება",
      titleEn: "Black Veined Marble Bar & Amber Glow",
      subtitleKa: "საღამოს კოქტეილებისა და მეგობრული შეხვედრების ეპიცენტრი",
      subtitleEn: "The social heart of Salt for evening cocktails and conversation"
    },
    {
      id: "gal-sunset-dining",
      category: "terrace",
      src: "assets/hero-terrace.jpg",
      span: "normal",
      titleKa: "რომანტიკული ვახშამი სანთლის შუქზე",
      titleEn: "Candlelit Rooftop Dining",
      subtitleKa: "სააკაძის დაღმართი 11 • Kani Aesthetics-ის შენობის მე-7 სართული",
      subtitleEn: "11 Saakadze Descent • 7th Floor Rooftop"
    }
  ];

  const SEATING_ZONES = [
    {
      id: "terrace",
      nameKa: "ღია პანორამული ტერასა",
      nameEn: "Open Panoramic Terrace",
      descKa: "მე-7 სართულის ღია სივრცე მთაწმინდისა და ღამის თბილისის ხედით",
      descEn: "7th-floor open-air rooftop with sweeping Tbilisi skyline views",
      capacityKa: "2–12 სტუმარი",
      capacityEn: "2–12 guests",
      badgeKa: "ყველაზე მოთხოვნადი",
      badgeEn: "Most Popular"
    },
    {
      id: "bar",
      nameKa: "მარმარილოს კოქტეილ-ბარი",
      nameEn: "Marble Cocktail Bar",
      descKa: "Liquid Art ბართან ახლოს — იდეალურია კოქტეილებისა და წყვილებისთვის",
      descEn: "Front-row seating at the black marble mixology bar",
      capacityKa: "1–4 სტუმარი",
      capacityEn: "1–4 guests",
      badgeKa: "Liquid Art",
      badgeEn: "Liquid Art"
    },
    {
      id: "indoor",
      nameKa: "დარბაზი & Lounge ზონა",
      nameEn: "Indoor Dining Lounge",
      descKa: "მყუდრო, ელეგანტური ინტერიერი პანორამული ვიტრაჟებითა და სცენასთან სიახლოვით",
      descEn: "Refined climate-controlled dining room near the live music stage",
      capacityKa: "2–10 სტუმარი",
      capacityEn: "2–10 guests",
      badgeKa: "ცოცხალ მუსიკასთან",
      badgeEn: "Near Live Stage"
    },
    {
      id: "vip-group",
      nameKa: "ჯგუფური / სადღესასწაულო მაგიდა",
      nameEn: "Celebration & Group Table",
      descKa: "გაერთიანებული VIP სივრცე დაბადების დღეებისა და კორპორატიული საღამოებისთვის",
      descEn: "Dedicated long table arrangement for birthdays and group celebrations",
      capacityKa: "8–30 სტუმარი",
      capacityEn: "8–30 guests",
      badgeKa: "ჯგუფებისთვის",
      badgeEn: "For Groups"
    }
  ];

  const GOOGLE_REVIEWS = [
    {
      id: "rev-1",
      rating: 5,
      authorKa: "ნინო კ.",
      authorEn: "Nino K.",
      roleKa: "Local Guide • Google Maps",
      roleEn: "Local Guide • Google Maps",
      dateKa: "2 კვირის წინ",
      dateEn: "2 weeks ago",
      textKa: "„საოცარი ხედი ღამის თბილისზე მე-7 სართულიდან! აჭარული ხაჭაპური და რუკოლას სალათი ნადუღით იყო უგემრიელესი, ხოლო კოქტეილები — ნამდვილი ხელოვნება. იდეალური ადგილია როგორც პაემნისთვის, ისე მეგობრებთან ერთად.“",
      textEn: "“Breathtaking view of night Tbilisi from the 7th floor! The Adjarian Khachapuri and Arugula salad with Nadughi were outstanding, and the cocktails are true liquid art. Perfect for both a date night and friends.”"
    },
    {
      id: "rev-2",
      rating: 5,
      authorKa: "დავით მ.",
      authorEn: "Davit M.",
      roleKa: "Google Maps მიმოხილვა",
      roleEn: "Google Maps Review",
      dateKa: "1 თვის წინ",
      dateEn: "1 month ago",
      textKa: "„დაბადების დღე გადავიხადეთ ტერასაზე. პერსონალი ძალიან ყურადღებიანია, ცოცხალმა მუსიკამ და DJ სეტმა საღამო დაუვიწყარი გახადა. ფასებიც სრულიად მისაღებია ასეთი დონის გარემოსთვის.“",
      textEn: "“Celebrated a birthday on the terrace. The staff was remarkably attentive, and the live music followed by the DJ set made the evening unforgettable. Great value for such an elevated setting.”"
    },
    {
      id: "rev-3",
      rating: 4,
      authorKa: "ელენე თ.",
      authorEn: "Elene T.",
      roleKa: "ბიზნეს ლანჩის სტუმარი",
      roleEn: "Business Lunch Guest",
      dateKa: "3 კვირის წინ",
      dateEn: "3 weeks ago",
      textKa: "„შუადღისას ხშირად მოვდივართ ბიზნეს-ლანჩზე სააკაძის დაღმართზე. ორაგულის კრუასანი და ისპანახის კრემ-სუპი ყოველთვის ახალი და გემრიელია, ტერასაზე კი სიმშვიდე და სასიამოვნო ნიავია.“",
      textEn: "“We often visit for weekday business lunch at Saakadze Descent. The salmon croissant and spinach velouté are always fresh, and the rooftop terrace is calm and breezy during the day.”"
    }
  ];

  /* ========================================================================
     2. RESERVATION FORM COMPONENT (All 7 Mandatory UI States)
     ======================================================================== */
  function ReservationForm({
    lang,
    preselectedZone,
    preselectedNotes,
    tastingList,
    compact,
    onSuccessClose
  }) {
    const todayStr = new Date().toISOString().split("T")[0];
    const [formData, setFormData] = useState({
      name: "",
      phone: "",
      guests: 2,
      date: todayStr,
      time: "20:00",
      zone: preselectedZone || "terrace",
      notes: preselectedNotes || ""
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle");
    const [bookingCode, setBookingCode] = useState("");

    useEffect(() => {
      if (preselectedZone) {
        setFormData((prev) => ({ ...prev, zone: preselectedZone }));
      }
    }, [preselectedZone]);

    useEffect(() => {
      if (preselectedNotes !== undefined && preselectedNotes !== "") {
        setFormData((prev) => ({ ...prev, notes: preselectedNotes }));
      }
    }, [preselectedNotes]);

    const validate = () => {
      const next = {};
      if (formData.name.trim().length < 2) {
        next.name =
          lang === "ka"
            ? "გთხოვთ მიუთითოთ თქვენი სახელი და გვარი (მინ. 2 სიმბოლო)"
            : "Please enter your full name (min. 2 characters)";
      }
      if (formData.phone.replace(/\D/g, "").length < 9) {
        next.phone =
          lang === "ka"
            ? "გთხოვთ მიუთითოთ ვალიდური ტელეფონის ნომერი (მინ. 9 ციფრი)"
            : "Please enter a valid phone number (at least 9 digits)";
      }
      const g = Number(formData.guests);
      if (!Number.isFinite(g) || g < 1 || g > 40) {
        next.guests =
          lang === "ka"
            ? "სტუმრების რაოდენობა უნდა იყოს 1-დან 40-მდე"
            : "Number of guests must be between 1 and 40";
      }
      if (!formData.date) {
        next.date = lang === "ka" ? "აირჩიეთ თარიღი" : "Select a date";
      }
      setErrors(next);
      return Object.keys(next).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!validate()) return;
      setStatus("submitting");
      setTimeout(() => {
        setBookingCode(`SLT-${Math.floor(1000 + Math.random() * 9000)}`);
        setStatus("success");
      }, 450);
    };

    const selectedZoneObj =
      SEATING_ZONES.find((z) => z.id === formData.zone) || SEATING_ZONES[0];

    if (status === "success") {
      return h(
        "div",
        {
          className:
            "p-6 sm:p-8 rounded-xl bg-basalt-900 border border-emerald-500/40 text-salt-50 space-y-6",
          role: "status",
          "aria-live": "polite"
        },
        h(
          "div",
          { className: "flex items-center gap-4" },
          h(
            "div",
            {
              className:
                "w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 text-xl font-bold shrink-0"
            },
            "✓"
          ),
          h(
            "div",
            null,
            h(
              "span",
              { className: "text-xs font-semibold tracking-wider text-emerald-400 tabular-nums" },
              lang === "ka" ? `ჯავშნის კოდი: ${bookingCode}` : `BOOKING REF: ${bookingCode}`
            ),
            h(
              "h3",
              { className: "font-serif text-2xl font-semibold text-salt-50" },
              lang === "ka" ? "ჯავშნის მოთხოვნა მიღებულია" : "Reservation Request Confirmed"
            )
          )
        ),
        h(
          "div",
          {
            className:
              "p-4 rounded-lg bg-basalt-950 border border-salt-50/10 space-y-2 text-sm tabular-nums"
          },
          h(
            "div",
            { className: "flex justify-between py-1 border-b border-salt-50/10" },
            h("span", { className: "text-salt-400" }, lang === "ka" ? "სტუმარი:" : "Guest:"),
            h("span", { className: "font-medium text-salt-50" }, formData.name)
          ),
          h(
            "div",
            { className: "flex justify-between py-1 border-b border-salt-50/10" },
            h("span", { className: "text-salt-400" }, lang === "ka" ? "თარიღი და დრო:" : "Date & Time:"),
            h("span", { className: "font-medium text-brass-300" }, `${formData.date} • ${formData.time}`)
          ),
          h(
            "div",
            { className: "flex justify-between py-1 border-b border-salt-50/10" },
            h("span", { className: "text-salt-400" }, lang === "ka" ? "სტუმრები:" : "Party Size:"),
            h(
              "span",
              { className: "font-medium text-salt-50" },
              `${formData.guests} ${lang === "ka" ? "სტუმარი" : "Guests"}`
            )
          ),
          h(
            "div",
            { className: "flex justify-between py-1" },
            h("span", { className: "text-salt-400" }, lang === "ka" ? "არჩეული ზონა:" : "Seating Zone:"),
            h(
              "span",
              { className: "font-medium text-salt-50" },
              lang === "ka" ? selectedZoneObj.nameKa : selectedZoneObj.nameEn
            )
          )
        ),
        h(
          "p",
          { className: "text-xs text-salt-300 leading-relaxed" },
          lang === "ka"
            ? "სწრაფი დადასტურებისთვის შეგიძლიათ ასევე დაგვიკავშირდეთ ნომერზე: "
            : "For immediate confirmation, please call us at ",
          h(
            "a",
            {
              href: `tel:${RESTAURANT_INFO.phoneRaw}`,
              className: "text-brass-400 font-semibold underline tabular-nums"
            },
            RESTAURANT_INFO.phone
          )
        ),
        h(
          "div",
          { className: "flex flex-wrap gap-3" },
          h(
            "button",
            {
              type: "button",
              onClick: () => setStatus("idle"),
              className:
                "min-h-[44px] px-5 py-2.5 rounded-md bg-basalt-800 hover:bg-basalt-700 border border-salt-50/15 text-sm font-medium text-salt-50 transition-colors"
            },
            lang === "ka" ? "ახალი ჯავშანი" : "New Booking"
          ),
          onSuccessClose &&
            h(
              "button",
              {
                type: "button",
                onClick: onSuccessClose,
                className:
                  "min-h-[44px] px-5 py-2.5 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 text-sm font-semibold transition-colors"
              },
              lang === "ka" ? "დახურვა" : "Close"
            )
        )
      );
    }

    return h(
      "form",
      { onSubmit: handleSubmit, noValidate: true, className: "space-y-5" },
      /* Zone Selector */
      h(
        "div",
        null,
        h(
          "label",
          { className: "block text-xs font-medium text-salt-300 mb-2" },
          lang === "ka"
            ? "აირჩიეთ სასურველი სივრცე (მე-7 სართული)"
            : "Select Seating Zone (7th Floor)"
        ),
        h(
          "div",
          { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5" },
          SEATING_ZONES.map((zone) => {
            const active = formData.zone === zone.id;
            return h(
              "button",
              {
                key: zone.id,
                type: "button",
                onClick: () => setFormData((prev) => ({ ...prev, zone: zone.id })),
                className: `text-left p-3.5 rounded-lg border transition-all ${
                  active
                    ? "bg-brass-400/15 border-brass-400 text-salt-50"
                    : "bg-basalt-950/90 border-salt-50/10 text-salt-300 hover:border-brass-400/40"
                }`
              },
              h(
                "div",
                { className: "flex items-center justify-between gap-2 mb-1" },
                h(
                  "span",
                  { className: "font-semibold text-sm text-salt-50" },
                  lang === "ka" ? zone.nameKa : zone.nameEn
                ),
                h(
                  "span",
                  {
                    className:
                      "text-xs px-2 py-0.5 rounded-full bg-basalt-900 text-brass-400 border border-brass-400/30 tabular-nums"
                  },
                  lang === "ka" ? zone.capacityKa : zone.capacityEn
                )
              ),
              h(
                "p",
                { className: "text-xs text-salt-400" },
                lang === "ka" ? zone.descKa : zone.descEn
              )
            );
          })
        )
      ),

      /* Name & Phone */
      h(
        "div",
        { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
        h(
          "div",
          null,
          h(
            "label",
            { htmlFor: "res-name", className: "block text-xs font-medium text-salt-300 mb-1.5" },
            lang === "ka" ? "სახელი და გვარი *" : "Full Name *"
          ),
          h("input", {
            id: "res-name",
            type: "text",
            value: formData.name,
            onChange: (e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, name: val }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            },
            placeholder: lang === "ka" ? "მაგ: გიორგი ბერიძე" : "e.g. Giorgi Beridze",
            className: `w-full min-h-[44px] px-3.5 py-2.5 rounded-md bg-basalt-950 border text-sm text-salt-50 ${
              errors.name ? "border-red-400" : "border-salt-50/15"
            }`
          }),
          errors.name && h("p", { className: "mt-1.5 text-xs text-red-400" }, errors.name)
        ),
        h(
          "div",
          null,
          h(
            "label",
            { htmlFor: "res-phone", className: "block text-xs font-medium text-salt-300 mb-1.5" },
            lang === "ka" ? "ტელეფონის ნომერი *" : "Phone Number *"
          ),
          h("input", {
            id: "res-phone",
            type: "tel",
            value: formData.phone,
            onChange: (e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, phone: val }));
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
            },
            placeholder: "+995 5XX XX XX XX",
            className: `w-full min-h-[44px] px-3.5 py-2.5 rounded-md bg-basalt-950 border text-sm text-salt-50 tabular-nums ${
              errors.phone ? "border-red-400" : "border-salt-50/15"
            }`
          }),
          errors.phone && h("p", { className: "mt-1.5 text-xs text-red-400" }, errors.phone)
        )
      ),

      /* Guests, Date, Time */
      h(
        "div",
        { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
        h(
          "div",
          null,
          h(
            "label",
            { htmlFor: "res-guests", className: "block text-xs font-medium text-salt-300 mb-1.5" },
            lang === "ka" ? "სტუმრების რაოდენობა *" : "Guests *"
          ),
          h("input", {
            id: "res-guests",
            type: "number",
            min: 1,
            max: 40,
            value: formData.guests,
            onChange: (e) =>
              setFormData((prev) => ({ ...prev, guests: e.target.value })),
            className:
              "w-full min-h-[44px] px-3.5 py-2.5 rounded-md bg-basalt-950 border border-salt-50/15 text-sm text-salt-50 tabular-nums"
          }),
          errors.guests && h("p", { className: "mt-1.5 text-xs text-red-400" }, errors.guests)
        ),
        h(
          "div",
          null,
          h(
            "label",
            { htmlFor: "res-date", className: "block text-xs font-medium text-salt-300 mb-1.5" },
            lang === "ka" ? "თარიღი *" : "Date *"
          ),
          h("input", {
            id: "res-date",
            type: "date",
            min: todayStr,
            value: formData.date,
            onChange: (e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value })),
            className:
              "w-full min-h-[44px] px-3.5 py-2.5 rounded-md bg-basalt-950 border border-salt-50/15 text-sm text-salt-50 tabular-nums"
          })
        ),
        h(
          "div",
          null,
          h(
            "label",
            { htmlFor: "res-time", className: "block text-xs font-medium text-salt-300 mb-1.5" },
            lang === "ka" ? "დრო *" : "Time *"
          ),
          h(
            "select",
            {
              id: "res-time",
              value: formData.time,
              onChange: (e) =>
                setFormData((prev) => ({ ...prev, time: e.target.value })),
              className:
                "w-full min-h-[44px] px-3.5 py-2.5 rounded-md bg-basalt-950 border border-salt-50/15 text-sm text-salt-50 tabular-nums"
            },
            [
              "12:30",
              "13:30",
              "14:30",
              "16:00",
              "18:00",
              "19:00",
              "20:00",
              "20:30",
              "21:00",
              "21:30",
              "22:00",
              "23:00"
            ].map((t) => h("option", { key: t, value: t }, t))
          )
        )
      ),

      /* Special Requests */
      h(
        "div",
        null,
        h(
          "label",
          { htmlFor: "res-notes", className: "block text-xs font-medium text-salt-300 mb-1.5" },
          lang === "ka"
            ? "დამატებითი სურვილი (დაბადების დღე, პანორამული კუთხის მაგიდა)"
            : "Special Requests (Birthday table, panoramic edge seat)"
        ),
        h("textarea", {
          id: "res-notes",
          rows: compact ? 2 : 3,
          value: formData.notes,
          onChange: (e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value })),
          placeholder:
            lang === "ka"
              ? "მაგ: გვსურს მაგიდა მთაწმინდის ხედით..."
              : "e.g. Railing edge table overlooking Mtatsminda...",
          className:
            "w-full px-3.5 py-2.5 rounded-md bg-basalt-950 border border-salt-50/15 text-sm text-salt-50"
        })
      ),

      tastingList.length > 0 &&
        h(
          "div",
          {
            className:
              "p-3 rounded-md bg-brass-400/10 border border-brass-400/30 text-xs text-salt-100"
          },
          h(
            "span",
            { className: "font-semibold text-brass-300 block mb-1" },
            lang === "ka"
              ? `მენიუდან არჩეულია ${tastingList.length} კერძი:`
              : `${tastingList.length} menu item(s) attached:`
          ),
          h(
            "span",
            null,
            tastingList.map((i) => (lang === "ka" ? i.nameKa : i.nameEn)).join(" • ")
          )
        ),

      h(
        "button",
        {
          type: "submit",
          disabled: status === "submitting",
          className:
            "w-full min-h-[48px] px-6 py-3 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-base transition-all cursor-pointer"
        },
        status === "submitting"
          ? lang === "ka"
            ? "ჯავშანი მუშავდება..."
            : "Confirming Table..."
          : lang === "ka"
          ? "მაგიდის დაჯავშნის დადასტურება"
          : "Confirm Table Reservation"
      )
    );
  }

  /* ========================================================================
     3. PAGE VIEWS
     ======================================================================== */

  function HomeView({ lang, navigate, openReservationModal }) {
    const featuredMenu = MENU_ITEMS.filter((i) => i.featured).slice(0, 4);

    return h(
      "div",
      null,
      /* Hero Section */
      h(
        "section",
        {
          className:
            "relative min-h-[86vh] flex items-end overflow-hidden border-b border-salt-50/10"
        },
        h(
          "div",
          { className: "absolute inset-0 z-0" },
          h("img", {
            src: "assets/hero-terrace.jpg",
            alt: "Salt Restaurant Terrace & Bar — 7th-floor panoramic terrace in Tbilisi",
            className: "w-full h-full object-cover"
          }),
          h("div", {
            className: "absolute inset-0",
            style: {
              background:
                "linear-gradient(to top, #090B0E 4%, rgba(9, 11, 14, 0.78) 46%, rgba(9, 11, 14, 0.35) 100%)"
            }
          })
        ),
        h(
          "div",
          {
            className:
              "relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-28 pb-16 lg:pb-24"
          },
          h(
            "div",
            { className: "grid grid-cols-1 lg:grid-cols-12 gap-10 items-end" },
            h(
              "div",
              { className: "lg:col-span-8 space-y-6" },
              h(
                "div",
                { className: "flex flex-wrap items-center gap-3" },
                h(
                  "a",
                  {
                    href: RESTAURANT_INFO.googleMapsUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className:
                      "inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-basalt-900/90 border border-brass-400/40 text-xs font-medium text-salt-50 hover:border-brass-300 transition-colors backdrop-blur-md"
                  },
                  h(
                    "span",
                    { className: "text-brass-400 font-semibold tabular-nums" },
                    `★ ${RESTAURANT_INFO.rating} Google Maps`
                  ),
                  h("span", { className: "text-salt-400" }, "•"),
                  h(
                    "span",
                    null,
                    lang === "ka"
                      ? "სააკაძის დაღმართი 11, მე-7 სართული"
                      : "11 Saakadze Descent, 7th Floor"
                  )
                ),
                h(
                  "span",
                  {
                    className:
                      "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-basalt-900/80 border border-salt-50/15 text-xs text-salt-200 backdrop-blur-md tabular-nums"
                  },
                  lang === "ka" ? "საშუალო ჩეკი: ₾50–₾60" : "Avg. Spend: ₾50–₾60"
                )
              ),
              h(
                "h1",
                {
                  className:
                    "font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-salt-50"
                },
                lang === "ka"
                  ? "გემო, ქალაქის პანორამა და საღამოს რიტმი მე-7 სართულზე"
                  : "Culinary Craft, Skyline Views & Evening Rhythm on the 7th Floor"
              ),
              h(
                "p",
                { className: "text-base sm:text-lg text-salt-300 max-w-2xl" },
                lang === "ka"
                  ? "Salt Restaurant | Terrace & Bar აერთიანებს ქართულ კულინარიულ მემკვიდრეობასა და ევროპულ გასტრონომიას, Liquid Art-ის საავტორო კოქტეილებსა და ცოცხალ მუსიკას ღამის თბილისის ჰორიზონტზე."
                  : "Salt Restaurant | Terrace & Bar pairs elevated Georgian and European dining with Liquid Art mixology and live music overlooking the illuminated Tbilisi skyline."
              ),
              h(
                "div",
                { className: "flex flex-wrap items-center gap-4 pt-2" },
                h(
                  "button",
                  {
                    type: "button",
                    onClick: () => openReservationModal({ zone: "terrace" }),
                    className:
                      "min-h-[48px] px-7 py-3.5 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-sm sm:text-base transition-all cursor-pointer"
                  },
                  lang === "ka" ? "ტერასაზე მაგიდის დაჯავშნა" : "Reserve Terrace Table"
                ),
                h(
                  "a",
                  {
                    href: "#/menu",
                    onClick: (e) => {
                      e.preventDefault();
                      navigate("/menu");
                    },
                    className:
                      "min-h-[48px] inline-flex items-center justify-center px-7 py-3.5 rounded-md bg-basalt-900/90 hover:bg-basalt-800 border border-salt-50/20 hover:border-brass-400/50 text-salt-50 font-semibold text-sm sm:text-base transition-all"
                  },
                  lang === "ka" ? "მენიუსა და ბარის ნახვა" : "Explore Menu & Bar"
                )
              )
            ),
            /* Right Architectural Schedule Card */
            h(
              "div",
              { className: "lg:col-span-4" },
              h(
                "div",
                {
                  className:
                    "p-6 rounded-xl bg-basalt-900/90 border border-salt-50/15 backdrop-blur-md space-y-4"
                },
                h(
                  "div",
                  {
                    className:
                      "flex items-center justify-between border-b border-salt-50/10 pb-3"
                  },
                  h(
                    "span",
                    { className: "font-serif text-lg font-semibold text-salt-50" },
                    lang === "ka" ? "დღეს Salt-ში" : "Today at Salt"
                  ),
                  h(
                    "span",
                    {
                      className:
                        "text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium tabular-nums"
                    },
                    "12:00 – 01:00"
                  )
                ),
                h(
                  "div",
                  { className: "space-y-3 text-sm" },
                  h(
                    "div",
                    { className: "flex justify-between gap-2" },
                    h("span", { className: "text-salt-400" }, lang === "ka" ? "ბიზნეს ლანჩი:" : "Business Lunch:"),
                    h("span", { className: "text-salt-50 font-medium tabular-nums" }, "12:00 – 16:00")
                  ),
                  h(
                    "div",
                    { className: "flex justify-between gap-2" },
                    h("span", { className: "text-salt-400" }, lang === "ka" ? "Sunset & კოქტეილები:" : "Sunset Aperitivo:"),
                    h("span", { className: "text-salt-50 font-medium tabular-nums" }, "17:30 – 20:30")
                  ),
                  h(
                    "div",
                    { className: "flex justify-between gap-2" },
                    h("span", { className: "text-salt-400" }, lang === "ka" ? "Live მუსიკა & DJ:" : "Live Music & DJ:"),
                    h("span", { className: "text-brass-300 font-medium tabular-nums" }, "20:30 – 01:00")
                  )
                ),
                h(
                  "div",
                  {
                    className:
                      "pt-2 border-t border-salt-50/10 flex items-center justify-between text-xs"
                  },
                  h(
                    "span",
                    { className: "text-salt-400" },
                    lang === "ka" ? "Kani Aesthetics-ის შენობა" : "Kani Aesthetics Building"
                  ),
                  h(
                    "a",
                    {
                      href: "#/terrace-events",
                      onClick: (e) => {
                        e.preventDefault();
                        navigate("/terrace-events");
                      },
                      className: "text-brass-400 hover:underline font-medium"
                    },
                    lang === "ka" ? "კვირის აფიშა" : "Weekly Lineup"
                  )
                )
              )
            )
          )
        )
      ),

      /* Three Expressions of Salt */
      h(
        "section",
        { className: "py-20 lg:py-24 bg-basalt-950 border-b border-salt-50/10" },
        h(
          "div",
          { className: "max-w-7xl mx-auto px-4 sm:px-6 space-y-12" },
          h(
            "div",
            { className: "flex flex-col md:flex-row md:items-end justify-between gap-6" },
            h(
              "div",
              { className: "space-y-3 max-w-2xl" },
              h(
                "h2",
                { className: "font-serif text-3xl sm:text-4xl font-semibold text-salt-50" },
                lang === "ka"
                  ? "სამი ელემენტი, რომელიც Salt-ის ხასიათს ქმნის"
                  : "Three Expressions of Salt"
              ),
              h(
                "p",
                { className: "text-salt-300 text-base" },
                lang === "ka"
                  ? "შუადღის მშვიდი ბიზნეს-ლანჩიდან დაწყებული, საღამოს სანთლებით განათებული ვახშმითა და ღამის DJ სეტებით დასრულებული."
                  : "From sunlit midday business lunches to candlelit rooftop dinners and nocturnal mixology sessions."
              )
            ),
            h(
              "a",
              {
                href: "#/terrace-events",
                onClick: (e) => {
                  e.preventDefault();
                  navigate("/terrace-events");
                },
                className:
                  "inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-md bg-basalt-900 border border-salt-50/15 hover:border-brass-400 text-sm font-medium text-salt-50 transition-colors"
              },
              lang === "ka" ? "სივრცისა და ივენთების ნახვა" : "Discover Terrace & Events"
            )
          ),
          h(
            "div",
            { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
            [
              {
                num: "01",
                tagKa: "გასტრონომია",
                tagEn: "CULINARY",
                titleKa: "ქართულ-ევროპული სამზარეულო",
                titleEn: "Georgian & European Fusion",
                descKa:
                  "აჭარული ხაჭაპური, შქმერული კეცზე, რუკოლას სალათი ნადუღით და საქონლის სუკის მედალიონები საფერავის სოუსში.",
                descEn:
                  "Artisanal Adjarian Khachapuri, clay-pan Shkmeruli, wild arugula with whipped Nadughi, and prime beef tenderloin.",
                img: "assets/georgian-feast.jpg",
                link: "/menu",
                ctaKa: "სრული მენიუს ნახვა",
                ctaEn: "Explore Full Menu"
              },
              {
                num: "02",
                tagKa: "პანორამა",
                tagEn: "THE ROOFTOP",
                titleKa: "მე-7 სართულის ღია ტერასა",
                titleEn: "7th-Floor Panoramic Terrace",
                descKa:
                  "სააკაძის დაღმართიდან გაშლილი ხედი მთაწმინდის ანძაზე, სამებასა და ნარიყალაზე — იდეალური გარემო პაემნისა და წვეულებისთვის.",
                descEn:
                  "Sweeping views of Mtatsminda TV Tower and Old Tbilisi from Saakadze Descent — designed for sunset aperitifs and celebrations.",
                img: "assets/hero-terrace.jpg",
                link: "/gallery",
                ctaKa: "ტერასის გალერეა",
                ctaEn: "View Terrace Gallery"
              },
              {
                num: "03",
                tagKa: "მიქსოლოგია & მუსიკა",
                tagEn: "LIQUID ART",
                titleKa: "Liquid Art & ცოცხალი მუსიკა",
                titleEn: "Liquid Art & Live Sessions",
                descKa:
                  "ზღვის მარილის რკალით დამშვენებული საავტორო კოქტეილები, ქართული ქვევრის ღვინოები, ცოცხალი ბენდები და DJ სეტები.",
                descEn:
                  "Sea-salt rimmed signature cocktails, curated Georgian Qvevri wines, live vocal bands, and weekend rooftop DJ sets.",
                img: "assets/signature-cocktail.jpg",
                link: "/terrace-events",
                ctaKa: "მუსიკალური პროგრამა",
                ctaEn: "See Live Schedule"
              }
            ].map((p) =>
              h(
                "article",
                {
                  key: p.num,
                  className:
                    "rounded-xl bg-basalt-900 border border-salt-50/10 hover:border-brass-400/40 overflow-hidden flex flex-col justify-between transition-colors"
                },
                h(
                  "div",
                  { className: "aspect-[16/10] overflow-hidden bg-basalt-800" },
                  h("img", {
                    src: p.img,
                    alt: lang === "ka" ? p.titleKa : p.titleEn,
                    className: "w-full h-full object-cover",
                    loading: "lazy"
                  })
                ),
                h(
                  "div",
                  { className: "p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4" },
                  h(
                    "div",
                    { className: "space-y-2.5" },
                    h(
                      "span",
                      { className: "font-serif text-lg font-semibold text-brass-400 tabular-nums" },
                      `${p.num} / ${lang === "ka" ? p.tagKa : p.tagEn}`
                    ),
                    h(
                      "h3",
                      { className: "font-serif text-2xl font-semibold text-salt-50" },
                      lang === "ka" ? p.titleKa : p.titleEn
                    ),
                    h(
                      "p",
                      { className: "text-sm text-salt-300" },
                      lang === "ka" ? p.descKa : p.descEn
                    )
                  ),
                  h(
                    "a",
                    {
                      href: `#${p.link}`,
                      onClick: (e) => {
                        e.preventDefault();
                        navigate(p.link);
                      },
                      className: "text-sm font-semibold text-brass-400 hover:text-brass-300 pt-2"
                    },
                    lang === "ka" ? p.ctaKa : p.ctaEn
                  )
                )
              )
            )
          )
        )
      ),

      /* Featured Menu Section */
      h(
        "section",
        { className: "py-20 lg:py-24 bg-basalt-900 border-b border-salt-50/10" },
        h(
          "div",
          { className: "max-w-7xl mx-auto px-4 sm:px-6 space-y-12" },
          h(
            "div",
            { className: "flex flex-col md:flex-row md:items-end justify-between gap-6" },
            h(
              "div",
              { className: "space-y-3 max-w-2xl" },
              h(
                "h2",
                { className: "font-serif text-3xl sm:text-4xl font-semibold text-salt-50" },
                lang === "ka"
                  ? "შეფ-მზარეულისა და ბარმენის რჩეული"
                  : "Chef's & Mixologist's Signatures"
              ),
              h(
                "p",
                { className: "text-salt-300 text-base" },
                lang === "ka"
                  ? "ყველაზე მოთხოვნადი კერძები და კოქტეილები ჩვენი მენიუდან."
                  : "Guest-favorite dishes and signature cocktails from the Salt kitchen and bar."
              )
            ),
            h(
              "a",
              {
                href: "#/menu",
                onClick: (e) => {
                  e.preventDefault();
                  navigate("/menu");
                },
                className:
                  "inline-flex items-center min-h-[44px] px-6 py-2.5 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-sm transition-colors"
              },
              lang === "ka" ? "მთლიანი მენიუს გახსნა (15 კერძი)" : "View Complete Menu (15 Items)"
            )
          ),
          h(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            featuredMenu.map((item) =>
              h(
                "div",
                {
                  key: item.id,
                  className:
                    "p-6 rounded-xl bg-basalt-950 border border-salt-50/10 hover:border-brass-400/40 flex flex-col sm:flex-row gap-5 transition-colors"
                },
                h("img", {
                  src: item.image,
                  alt: lang === "ka" ? item.nameKa : item.nameEn,
                  className:
                    "w-full sm:w-36 h-40 sm:h-36 rounded-lg object-cover shrink-0 border border-salt-50/10",
                  loading: "lazy"
                }),
                h(
                  "div",
                  { className: "flex-1 flex flex-col justify-between space-y-3" },
                  h(
                    "div",
                    null,
                    h(
                      "div",
                      { className: "flex items-start justify-between gap-3" },
                      h(
                        "span",
                        { className: "text-xs font-medium text-brass-400" },
                        lang === "ka" ? item.tagKa : item.tagEn
                      ),
                      h(
                        "span",
                        { className: "font-serif text-xl font-bold text-salt-50 tabular-nums" },
                        `₾${item.price}`
                      )
                    ),
                    h(
                      "h3",
                      { className: "font-serif text-xl font-semibold text-salt-50 mt-1" },
                      lang === "ka" ? item.nameKa : item.nameEn
                    ),
                    h(
                      "p",
                      { className: "text-sm text-salt-300 mt-1.5" },
                      lang === "ka" ? item.descKa : item.descEn
                    )
                  ),
                  h(
                    "div",
                    {
                      className:
                        "text-xs text-salt-400 pt-2 border-t border-salt-50/10 flex items-center justify-between"
                    },
                    h("span", null, lang === "ka" ? item.pairingKa : item.pairingEn),
                    h("span", { className: "tabular-nums" }, item.weight)
                  )
                )
              )
            )
          )
        )
      ),

      /* Google Maps Reviews Section */
      h(
        "section",
        { className: "py-20 lg:py-24 bg-basalt-950 border-b border-salt-50/10" },
        h(
          "div",
          { className: "max-w-7xl mx-auto px-4 sm:px-6 space-y-12" },
          h(
            "div",
            {
              className:
                "flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-salt-50/10"
            },
            h(
              "div",
              { className: "space-y-2 max-w-xl" },
              h(
                "h2",
                { className: "font-serif text-3xl sm:text-4xl font-semibold text-salt-50" },
                lang === "ka"
                  ? "სტუმრების შთაბეჭდილებები Google Maps-დან"
                  : "Guest Voices on Google Maps"
              ),
              h(
                "p",
                { className: "text-salt-300 text-sm sm:text-base" },
                lang === "ka"
                  ? "რას აღნიშნავენ სტუმრები ჩვენს ტერასაზე, სამზარეულოსა და მომსახურებაზე."
                  : "Real feedback from guests visiting our 7th-floor rooftop in Tbilisi."
              )
            ),
            h(
              "div",
              {
                className:
                  "flex flex-wrap items-center gap-6 p-5 rounded-xl bg-basalt-900 border border-salt-50/15"
              },
              h(
                "div",
                { className: "flex items-center gap-4" },
                h(
                  "span",
                  { className: "font-serif text-4xl font-bold text-brass-400 tabular-nums" },
                  RESTAURANT_INFO.rating
                ),
                h(
                  "div",
                  null,
                  h("div", { className: "text-brass-400 text-sm" }, "★★★★☆"),
                  h(
                    "div",
                    { className: "text-xs text-salt-300 mt-0.5" },
                    lang === "ka" ? "Google Maps-ის ოფიციალური რეიტინგი" : "Verified Google Maps Rating"
                  )
                )
              ),
              h(
                "a",
                {
                  href: RESTAURANT_INFO.googleMapsUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className:
                    "min-h-[44px] inline-flex items-center px-4 py-2 rounded-md bg-basalt-950 hover:bg-basalt-800 border border-brass-400/40 text-xs font-semibold text-brass-300 transition-colors"
                },
                lang === "ka" ? "Google Maps-ზე გახსნა" : "View on Google Maps"
              )
            )
          ),
          h(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
            GOOGLE_REVIEWS.map((rev) =>
              h(
                "blockquote",
                {
                  key: rev.id,
                  className:
                    "p-6 rounded-xl bg-basalt-900 border border-salt-50/10 flex flex-col justify-between space-y-6"
                },
                h(
                  "div",
                  { className: "space-y-3" },
                  h(
                    "div",
                    { className: "flex items-center justify-between text-xs text-salt-400" },
                    h("span", { className: "text-brass-400" }, "★".repeat(rev.rating)),
                    h("span", null, lang === "ka" ? rev.dateKa : rev.dateEn)
                  ),
                  h(
                    "p",
                    { className: "text-sm text-salt-100" },
                    lang === "ka" ? rev.textKa : rev.textEn
                  )
                ),
                h(
                  "footer",
                  { className: "pt-3 border-t border-salt-50/10" },
                  h(
                    "div",
                    { className: "font-semibold text-sm text-salt-50" },
                    lang === "ka" ? rev.authorKa : rev.authorEn
                  ),
                  h("div", { className: "text-xs text-salt-400" }, lang === "ka" ? rev.roleKa : rev.roleEn)
                )
              )
            )
          )
        )
      )
    );
  }

  function MenuView({
    lang,
    tastingList,
    toggleTastingItem,
    clearTastingList,
    openReservationModal
  }) {
    const [activeCategory, setActiveCategory] = useState("all");
    const [activeDietary, setActiveDietary] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDish, setSelectedDish] = useState(null);

    const categories = [
      { id: "all", labelKa: "ყველა კატეგორია", labelEn: "All Categories" },
      { id: "georgian", labelKa: "ქართული კლასიკა", labelEn: "Georgian Heritage" },
      { id: "salads", labelKa: "სალათები & დაფები", labelEn: "Salads & Boards" },
      { id: "mains", labelKa: "ცხელი კერძები", labelEn: "Mains & Grill" },
      { id: "lunch", labelKa: "ბიზნეს ლანჩი (12:00–16:00)", labelEn: "Business Lunch" },
      { id: "drinks", labelKa: "Liquid Art ბარი", labelEn: "Liquid Art & Bar" }
    ];

    const dietaryFilters = [
      { id: "all", labelKa: "ყველა", labelEn: "All" },
      { id: "signature", labelKa: "საფირმო / შეფის რჩეული", labelEn: "Signature" },
      { id: "vegetarian", labelKa: "ვეგეტარიანული", labelEn: "Vegetarian" },
      { id: "shareable", labelKa: "გასაზიარებელი", labelEn: "To Share" }
    ];

    const filteredItems = useMemo(() => {
      const q = searchQuery.trim().toLowerCase();
      return MENU_ITEMS.filter((item) => {
        const matchCat = activeCategory === "all" || item.category === activeCategory;
        const matchDiet =
          activeDietary === "all" || (item.dietary && item.dietary.includes(activeDietary));
        const text = `${item.nameKa} ${item.nameEn} ${item.descKa} ${item.descEn} ${item.pairingKa} ${item.pairingEn}`.toLowerCase();
        const matchSearch = !q || text.includes(q);
        return matchCat && matchDiet && matchSearch;
      });
    }, [activeCategory, activeDietary, searchQuery]);

    const totalTastingPrice = tastingList.reduce((acc, item) => acc + item.price, 0);

    return h(
      "div",
      { className: "py-12 lg:py-20 bg-basalt-950 min-h-screen" },
      h(
        "div",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 space-y-10" },
        /* Header */
        h(
          "div",
          {
            className:
              "border-b border-salt-50/10 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6"
          },
          h(
            "div",
            { className: "space-y-3 max-w-2xl" },
            h(
              "span",
              { className: "text-xs font-semibold tracking-wider text-brass-400" },
              lang === "ka"
                ? "გასტრონომია და მიქსოლოგია • SALT TBILISI"
                : "GASTRONOMY & MIXOLOGY • SALT TBILISI"
            ),
            h(
              "h1",
              { className: "font-serif text-4xl sm:text-5xl font-semibold text-salt-50" },
              lang === "ka" ? "რესტორნის მენიუ და Liquid Art ბარი" : "Restaurant Menu & Liquid Art Bar"
            ),
            h(
              "p",
              { className: "text-salt-300 text-base" },
              lang === "ka"
                ? "შეარჩიეთ სასურველი კერძები და კოქტეილები, შეადგინეთ თქვენი სუფრის წინასწარი სია და დაურთეთ მაგიდის ჯავშანს."
                : "Browse our Georgian-European kitchen and mixology bar. Add favorites to your Table Tasting Selection."
            )
          ),
          h(
            "div",
            { className: "w-full lg:w-80" },
            h("input", {
              type: "search",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder:
                lang === "ka"
                  ? "მოძებნეთ კერძი, ღვინო, ინგრედიენტი..."
                  : "Search dish, cocktail, ingredient...",
              className:
                "w-full min-h-[44px] px-4 py-2.5 rounded-md bg-basalt-900 border border-salt-50/15 text-sm text-salt-50"
            })
          )
        ),

        /* Category Tabs */
        h(
          "div",
          { className: "space-y-4" },
          h(
            "div",
            { className: "flex flex-wrap gap-2", role: "tablist" },
            categories.map((cat) => {
              const active = activeCategory === cat.id;
              return h(
                "button",
                {
                  key: cat.id,
                  type: "button",
                  role: "tab",
                  "aria-selected": active,
                  onClick: () => setActiveCategory(cat.id),
                  className: `min-h-[44px] px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-brass-400 text-basalt-950 font-semibold"
                      : "bg-basalt-900 text-salt-300 border border-salt-50/10 hover:border-brass-400/40 hover:text-salt-50"
                  }`
                },
                lang === "ka" ? cat.labelKa : cat.labelEn
              );
            })
          ),
          h(
            "div",
            { className: "flex flex-wrap items-center justify-between gap-4 pt-2" },
            h(
              "div",
              { className: "flex flex-wrap items-center gap-2" },
              dietaryFilters.map((df) => {
                const active = activeDietary === df.id;
                return h(
                  "button",
                  {
                    key: df.id,
                    type: "button",
                    onClick: () => setActiveDietary(df.id),
                    className: `min-h-[36px] px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      active
                        ? "bg-brass-400/20 border-brass-400 text-brass-300"
                        : "bg-basalt-900/60 border-salt-50/10 text-salt-300"
                    }`
                  },
                  lang === "ka" ? df.labelKa : df.labelEn
                );
              })
            ),
            h(
              "div",
              { className: "text-xs text-salt-400 tabular-nums" },
              lang === "ka"
                ? `ნაჩვენებია ${filteredItems.length} პოზიცია`
                : `Showing ${filteredItems.length} item(s)`
            )
          )
        ),

        /* Tasting Selection Bar */
        tastingList.length > 0 &&
          h(
            "div",
            {
              className:
                "p-5 rounded-xl bg-basalt-900 border border-brass-400/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            },
            h(
              "div",
              { className: "space-y-1" },
              h(
                "div",
                { className: "flex items-center gap-2.5" },
                h(
                  "span",
                  {
                    className:
                      "px-2.5 py-0.5 text-xs font-bold rounded-full bg-brass-400 text-basalt-950 tabular-nums"
                  },
                  tastingList.length
                ),
                h(
                  "h2",
                  { className: "font-serif text-lg font-semibold text-salt-50" },
                  lang === "ka"
                    ? "თქვენი შერჩეული სუფრა (Tasting Selection)"
                    : "Your Table Tasting Selection"
                ),
                h(
                  "span",
                  { className: "text-sm font-semibold text-brass-300 tabular-nums" },
                  `• ₾${totalTastingPrice}`
                )
              ),
              h(
                "p",
                { className: "text-xs text-salt-300" },
                tastingList.map((i) => (lang === "ka" ? i.nameKa : i.nameEn)).join(" • ")
              )
            ),
            h(
              "div",
              { className: "flex items-center gap-3 shrink-0" },
              h(
                "button",
                {
                  type: "button",
                  onClick: clearTastingList,
                  className:
                    "min-h-[40px] px-3.5 py-1.5 rounded-md bg-basalt-950 border border-salt-50/15 text-xs text-salt-300 cursor-pointer"
                },
                lang === "ka" ? "გასუფთავება" : "Clear"
              ),
              h(
                "button",
                {
                  type: "button",
                  onClick: () => openReservationModal(),
                  className:
                    "min-h-[40px] px-4 py-2 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 text-xs font-semibold cursor-pointer"
                },
                lang === "ka" ? "ჯავშანზე მიბმა" : "Attach to Reservation"
              )
            )
          ),

        /* Menu Grid or Empty State */
        filteredItems.length === 0
          ? h(
              "div",
              {
                className:
                  "p-12 rounded-xl bg-basalt-900 border border-salt-50/10 text-center space-y-4"
              },
              h(
                "p",
                { className: "font-serif text-2xl text-salt-50" },
                lang === "ka"
                  ? "მოთხოვნილი კერძი ან სასმელი ვერ მოიძებნა"
                  : "No matching dishes or drinks found"
              ),
              h(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setActiveCategory("all");
                    setActiveDietary("all");
                    setSearchQuery("");
                  },
                  className:
                    "min-h-[44px] px-6 py-2.5 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-sm cursor-pointer"
                },
                lang === "ka" ? "ყველა კერძის ჩვენება" : "Reset All Filters"
              )
            )
          : h(
              "div",
              { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
              filteredItems.map((item) => {
                const inList = tastingList.some((i) => i.id === item.id);
                return h(
                  "article",
                  {
                    key: item.id,
                    className:
                      "rounded-xl bg-basalt-900 border border-salt-50/10 hover:border-brass-400/40 overflow-hidden flex flex-col justify-between transition-colors"
                  },
                  h(
                    "div",
                    null,
                    h(
                      "div",
                      { className: "relative aspect-[16/10] bg-basalt-800 overflow-hidden" },
                      h("img", {
                        src: item.image,
                        alt: lang === "ka" ? item.nameKa : item.nameEn,
                        className: "w-full h-full object-cover",
                        loading: "lazy"
                      }),
                      h(
                        "span",
                        {
                          className:
                            "absolute top-3 left-3 px-2.5 py-1 rounded-full bg-basalt-950/90 border border-salt-50/15 text-xs font-medium text-brass-300"
                        },
                        lang === "ka" ? item.tagKa : item.tagEn
                      ),
                      h(
                        "span",
                        {
                          className:
                            "absolute bottom-3 right-3 px-3 py-1 rounded-md bg-basalt-950/90 border border-brass-400/40 font-serif text-lg font-bold text-salt-50 tabular-nums"
                        },
                        `₾${item.price}`
                      )
                    ),
                    h(
                      "div",
                      { className: "p-6 space-y-3" },
                      h(
                        "h2",
                        { className: "font-serif text-xl font-semibold text-salt-50" },
                        lang === "ka" ? item.nameKa : item.nameEn
                      ),
                      h(
                        "p",
                        { className: "text-sm text-salt-300" },
                        lang === "ka" ? item.descKa : item.descEn
                      ),
                      h(
                        "div",
                        {
                          className:
                            "pt-2 text-xs text-brass-400 flex items-center justify-between gap-2 border-t border-salt-50/10"
                        },
                        h("span", null, lang === "ka" ? item.pairingKa : item.pairingEn),
                        h("span", { className: "text-salt-400 shrink-0 tabular-nums" }, item.weight)
                      )
                    )
                  ),
                  h(
                    "div",
                    { className: "px-6 pb-6 pt-2 flex items-center gap-2.5" },
                    h(
                      "button",
                      {
                        type: "button",
                        onClick: () => toggleTastingItem(item),
                        className: `flex-1 min-h-[44px] px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          inList
                            ? "bg-emerald-500/20 border border-emerald-400 text-emerald-300"
                            : "bg-basalt-950 hover:bg-basalt-800 border border-salt-50/15 text-salt-50"
                        }`
                      },
                      inList
                        ? lang === "ka"
                          ? "✓ არჩეულია სუფრისთვის"
                          : "✓ Added to Selection"
                        : lang === "ka"
                        ? "+ სუფრის სიაში დამატება"
                        : "+ Add to Tasting List"
                    ),
                    h(
                      "button",
                      {
                        type: "button",
                        onClick: () => setSelectedDish(item),
                        className:
                          "min-h-[44px] px-3.5 py-2 rounded-md bg-basalt-950 hover:border-brass-400 border border-salt-50/15 text-xs text-salt-300 hover:text-salt-50 transition-colors cursor-pointer"
                      },
                      lang === "ka" ? "დეტალები" : "Details"
                    )
                  )
                );
              })
            )
      ),

      /* Dish Detail Modal */
      selectedDish &&
        h(
          "div",
          {
            className:
              "fixed inset-0 z-50 flex items-center justify-center p-4 bg-basalt-950/85 backdrop-blur-md",
            role: "dialog",
            "aria-modal": "true",
            onClick: (e) => {
              if (e.target === e.currentTarget) setSelectedDish(null);
            }
          },
          h(
            "div",
            {
              className:
                "w-full max-w-lg rounded-xl bg-basalt-900 border border-salt-50/15 overflow-hidden"
            },
            h(
              "div",
              { className: "relative aspect-[16/10]" },
              h("img", {
                src: selectedDish.image,
                alt: lang === "ka" ? selectedDish.nameKa : selectedDish.nameEn,
                className: "w-full h-full object-cover"
              })
            ),
            h(
              "div",
              { className: "p-6 space-y-4" },
              h(
                "div",
                { className: "flex items-baseline justify-between gap-4" },
                h(
                  "span",
                  { className: "text-xs font-semibold text-brass-400" },
                  lang === "ka" ? selectedDish.tagKa : selectedDish.tagEn
                ),
                h(
                  "span",
                  { className: "font-serif text-2xl font-bold text-salt-50 tabular-nums" },
                  `₾${selectedDish.price}`
                )
              ),
              h(
                "h3",
                { className: "font-serif text-2xl font-semibold text-salt-50" },
                lang === "ka" ? selectedDish.nameKa : selectedDish.nameEn
              ),
              h(
                "p",
                { className: "text-sm text-salt-300" },
                lang === "ka" ? selectedDish.descKa : selectedDish.descEn
              ),
              h(
                "div",
                { className: "flex gap-3 pt-2" },
                h(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      toggleTastingItem(selectedDish);
                      setSelectedDish(null);
                    },
                    className:
                      "flex-1 min-h-[44px] px-4 py-2.5 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-sm cursor-pointer"
                  },
                  lang === "ka" ? "სუფრის სიაში დამატება" : "Add to Selection"
                ),
                h(
                  "button",
                  {
                    type: "button",
                    onClick: () => setSelectedDish(null),
                    className:
                      "min-h-[44px] px-5 py-2.5 rounded-md bg-basalt-950 border border-salt-50/15 text-sm text-salt-300 cursor-pointer"
                  },
                  lang === "ka" ? "დახურვა" : "Close"
                )
              )
            )
          )
        )
    );
  }

  function TerraceEventsView({ lang, openReservationModal }) {
    return h(
      "div",
      { className: "py-12 lg:py-20 bg-basalt-950 min-h-screen space-y-20" },
      /* Hero */
      h(
        "section",
        { className: "max-w-7xl mx-auto px-4 sm:px-6" },
        h(
          "div",
          { className: "grid grid-cols-1 lg:grid-cols-12 gap-10 items-center" },
          h(
            "div",
            { className: "lg:col-span-6 space-y-5" },
            h(
              "span",
              { className: "text-xs font-semibold tracking-wider text-brass-400" },
              lang === "ka"
                ? "მე-7 სართულის პანორამული სივრცე • ცოცხალი მუსიკა & ივენთები"
                : "7TH-FLOOR ROOFTOP • LIVE MUSIC & PRIVATE EVENTS"
            ),
            h(
              "h1",
              { className: "font-serif text-4xl sm:text-5xl font-semibold text-salt-50" },
              lang === "ka"
                ? "ტერასა, საღამოს მუსიკალური სესიები და წვეულებები"
                : "The Rooftop Terrace, Live Sessions & Celebrations"
            ),
            h(
              "p",
              { className: "text-salt-300 text-base" },
              lang === "ka"
                ? "Kani Aesthetics-ის შენობის მე-7 სართულზე განთავსებული Salt-ის ტერასა აერთიანებს ღია ცის ქვეშ სადილს, მარმარილოს კოქტეილ-ბარსა და ცოცხალი მუსიკის სცენას მთაწმინდის ანძისა და ძველი თბილისის ხედით."
                : "Perched on the 7th floor at Saakadze Descent, Salt's rooftop combines open-air dining, a black veined marble cocktail bar, and live musical evenings with panoramic Tbilisi views."
            ),
            h(
              "div",
              { className: "flex flex-wrap gap-3 pt-2" },
              h(
                "button",
                {
                  type: "button",
                  onClick: () => openReservationModal({ zone: "terrace" }),
                  className:
                    "min-h-[48px] px-6 py-3 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-sm cursor-pointer"
                },
                lang === "ka" ? "ტერასის მაგიდის დაჯავშნა" : "Reserve Terrace Table"
              ),
              h(
                "a",
                {
                  href: RESTAURANT_INFO.instagramUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className:
                    "min-h-[48px] inline-flex items-center px-5 py-3 rounded-md bg-basalt-900 border border-salt-50/15 hover:border-brass-400 text-salt-50 text-sm font-medium"
                },
                lang === "ka" ? "Instagram Reels (@salt_restaurant_)" : "Watch Live Reels on Instagram"
              )
            )
          ),
          h(
            "div",
            { className: "lg:col-span-6" },
            h(
              "div",
              { className: "rounded-2xl overflow-hidden border border-salt-50/15" },
              h("img", {
                src: "assets/hero-terrace.jpg",
                alt: "Salt Rooftop Terrace Night View",
                className: "w-full aspect-[16/10] object-cover"
              })
            )
          )
        )
      ),

      /* Four Architectural Zones */
      h(
        "section",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 space-y-8" },
        h(
          "div",
          { className: "space-y-2" },
          h(
            "h2",
            { className: "font-serif text-3xl font-semibold text-salt-50" },
            lang === "ka"
              ? "ოთხი განსხვავებული ზონა ერთ სივრცეში"
              : "Four Distinct Architectural Zones"
          )
        ),
        h(
          "div",
          { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" },
          SEATING_ZONES.map((zone) =>
            h(
              "div",
              {
                key: zone.id,
                className:
                  "p-6 rounded-xl bg-basalt-900 border border-salt-50/10 flex flex-col justify-between space-y-5"
              },
              h(
                "div",
                { className: "space-y-2.5" },
                h(
                  "div",
                  { className: "flex items-center justify-between gap-2" },
                  h(
                    "span",
                    {
                      className:
                        "px-2.5 py-0.5 rounded-full bg-brass-400/15 text-brass-300 text-xs font-semibold"
                    },
                    lang === "ka" ? zone.badgeKa : zone.badgeEn
                  ),
                  h(
                    "span",
                    { className: "text-xs text-salt-400 tabular-nums" },
                    lang === "ka" ? zone.capacityKa : zone.capacityEn
                  )
                ),
                h(
                  "h3",
                  { className: "font-serif text-xl font-semibold text-salt-50" },
                  lang === "ka" ? zone.nameKa : zone.nameEn
                ),
                h(
                  "p",
                  { className: "text-xs sm:text-sm text-salt-300" },
                  lang === "ka" ? zone.descKa : zone.descEn
                )
              ),
              h(
                "button",
                {
                  type: "button",
                  onClick: () => openReservationModal({ zone: zone.id }),
                  className:
                    "w-full min-h-[42px] px-4 py-2 rounded-md bg-basalt-950 hover:bg-brass-400 hover:text-basalt-950 border border-salt-50/15 text-xs font-semibold text-salt-50 transition-colors cursor-pointer"
                },
                lang === "ka" ? "ამ ზონის დაჯავშნა" : "Book This Zone"
              )
            )
          )
        )
      ),

      /* Weekly Schedule */
      h(
        "section",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 space-y-8" },
        h(
          "h2",
          { className: "font-serif text-3xl font-semibold text-salt-50" },
          lang === "ka"
            ? "კვირის მუსიკალური და გასტრონომიული განრიგი"
            : "Weekly Musical & Dining Cadence"
        ),
        h(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
          TERRACE_EVENTS.map((ev) =>
            h(
              "article",
              {
                key: ev.id,
                className:
                  "rounded-xl bg-basalt-900 border border-salt-50/10 overflow-hidden flex flex-col justify-between"
              },
              h(
                "div",
                { className: "p-6 sm:p-8 space-y-4" },
                h(
                  "div",
                  { className: "flex flex-wrap items-center justify-between gap-2" },
                  h(
                    "span",
                    {
                      className:
                        "px-3 py-1 rounded-full bg-brass-400/15 text-brass-300 text-xs font-semibold"
                    },
                    lang === "ka" ? ev.badgeKa : ev.badgeEn
                  ),
                  h(
                    "span",
                    { className: "text-xs font-medium text-salt-300 tabular-nums" },
                    lang === "ka" ? ev.dayKa : ev.dayEn
                  )
                ),
                h(
                  "h3",
                  { className: "font-serif text-2xl font-semibold text-salt-50" },
                  lang === "ka" ? ev.titleKa : ev.titleEn
                ),
                h(
                  "p",
                  { className: "text-sm text-salt-300" },
                  lang === "ka" ? ev.descKa : ev.descEn
                )
              ),
              h(
                "div",
                {
                  className:
                    "px-6 sm:px-8 py-4 bg-basalt-950/70 border-t border-salt-50/10 flex items-center justify-between"
                },
                h(
                  "span",
                  { className: "text-xs text-salt-400" },
                  lang === "ka"
                    ? "სააკაძის დაღმართი 11 • მე-7 სართული"
                    : "11 Saakadze Descent • 7th Floor"
                ),
                h(
                  "button",
                  {
                    type: "button",
                    onClick: () =>
                      openReservationModal({
                        zone: ev.zone,
                        notes: lang === "ka" ? `ივენთი: ${ev.titleKa}` : `Event: ${ev.titleEn}`
                      }),
                    className:
                      "min-h-[40px] px-4 py-2 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 text-xs font-semibold cursor-pointer"
                  },
                  lang === "ka" ? "მაგიდის დაჯავშნა" : "Reserve Table"
                )
              )
            )
          )
        )
      ),

      /* Group Celebrations */
      h(
        "section",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 space-y-8" },
        h(
          "h2",
          { className: "font-serif text-3xl font-semibold text-salt-50" },
          lang === "ka"
            ? "ჯგუფური შეთავაზებები, დაბადების დღე და კორპორატიული საღამოები"
            : "Group Packages, Birthdays & Private Receptions"
        ),
        h(
          "div",
          { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
          GROUP_PACKAGES.map((pkg) =>
            h(
              "div",
              {
                key: pkg.id,
                className:
                  "p-6 sm:p-8 rounded-xl bg-basalt-900 border border-brass-400/30 flex flex-col justify-between space-y-6"
              },
              h(
                "div",
                { className: "space-y-4" },
                h(
                  "div",
                  {
                    className:
                      "flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-salt-50/10"
                  },
                  h(
                    "div",
                    null,
                    h(
                      "span",
                      { className: "text-xs font-semibold text-brass-400 tabular-nums" },
                      lang === "ka" ? pkg.guestsKa : pkg.guestsEn
                    ),
                    h(
                      "h3",
                      { className: "font-serif text-2xl font-semibold text-salt-50 mt-0.5" },
                      lang === "ka" ? pkg.nameKa : pkg.nameEn
                    )
                  ),
                  h(
                    "span",
                    {
                      className:
                        "px-3.5 py-1.5 rounded-md bg-basalt-950 border border-brass-400/40 font-serif text-lg font-semibold text-brass-300 tabular-nums"
                    },
                    lang === "ka" ? pkg.priceKa : pkg.priceEn
                  )
                ),
                h(
                  "ul",
                  { className: "space-y-2.5 text-sm text-salt-200" },
                  (lang === "ka" ? pkg.featuresKa : pkg.featuresEn).map((feat, idx) =>
                    h(
                      "li",
                      { key: idx, className: "flex items-start gap-2.5" },
                      h("span", { className: "text-brass-400 font-bold" }, "•"),
                      h("span", null, feat)
                    )
                  )
                )
              ),
              h(
                "button",
                {
                  type: "button",
                  onClick: () =>
                    openReservationModal({
                      zone: "vip-group",
                      notes: lang === "ka" ? `პაკეტი: ${pkg.nameKa}` : `Package: ${pkg.nameEn}`
                    }),
                  className:
                    "w-full min-h-[46px] px-5 py-2.5 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-sm cursor-pointer"
                },
                lang === "ka" ? "ჯგუფური ჯავშნის მოთხოვნა" : "Request Group Package"
              )
            )
          )
        )
      )
    );
  }

  function GalleryView({ lang, openReservationModal }) {
    const [activeFilter, setActiveFilter] = useState("all");
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const filters = [
      { id: "all", labelKa: "ყველა კადრი", labelEn: "All Moments" },
      { id: "terrace", labelKa: "მე-7 სართულის ტერასა", labelEn: "7th-Floor Terrace" },
      { id: "culinary", labelKa: "კულინარია", labelEn: "Culinary Craft" },
      { id: "bar", labelKa: "Liquid Art & ბარი", labelEn: "Liquid Art & Bar" }
    ];

    const visibleItems =
      activeFilter === "all"
        ? GALLERY_ITEMS
        : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

    const currentLightboxItem =
      lightboxIndex !== null && visibleItems[lightboxIndex] ? visibleItems[lightboxIndex] : null;

    return h(
      "div",
      { className: "py-12 lg:py-20 bg-basalt-950 min-h-screen space-y-12" },
      h(
        "div",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 space-y-10" },
        /* Header */
        h(
          "div",
          {
            className:
              "flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-salt-50/10 pb-8"
          },
          h(
            "div",
            { className: "space-y-3 max-w-2xl" },
            h(
              "span",
              { className: "text-xs font-semibold tracking-wider text-brass-400" },
              lang === "ka" ? "ვიზუალური ისტორია • SALT TBILISI" : "VISUAL STORY • SALT TBILISI"
            ),
            h(
              "h1",
              { className: "font-serif text-4xl sm:text-5xl font-semibold text-salt-50" },
              lang === "ka" ? "გალერეა და საღამოს ატმოსფერო" : "Gallery & Nocturnal Atmosphere"
            ),
            h(
              "p",
              { className: "text-salt-300 text-base" },
              lang === "ka"
                ? "დაათვალიერეთ ჩვენი ღია ტერასა, კერძების სერვირება და მარმარილოს კოქტეილ-ბარი. დააწკაპუნეთ ფოტოზე გასადიდებლად."
                : "Explore our 7th-floor rooftop views, plated culinary creations, and black marble cocktail bar."
            )
          ),
          h(
            "div",
            { className: "flex flex-wrap gap-2" },
            filters.map((f) => {
              const active = activeFilter === f.id;
              return h(
                "button",
                {
                  key: f.id,
                  type: "button",
                  onClick: () => {
                    setActiveFilter(f.id);
                    setLightboxIndex(null);
                  },
                  className: `min-h-[42px] px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-brass-400 text-basalt-950 font-semibold"
                      : "bg-basalt-900 border border-salt-50/15 text-salt-300 hover:border-brass-400"
                  }`
                },
                lang === "ka" ? f.labelKa : f.labelEn
              );
            })
          )
        ),

        /* Gallery Grid */
        h(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
          visibleItems.map((item, idx) =>
            h(
              "figure",
              {
                key: item.id,
                onClick: () => setLightboxIndex(idx),
                className: `rounded-xl bg-basalt-900 border border-salt-50/10 hover:border-brass-400/50 overflow-hidden cursor-pointer flex flex-col justify-between ${
                  item.span === "wide" && activeFilter === "all" ? "md:col-span-2" : ""
                }`
              },
              h(
                "div",
                { className: "relative aspect-[16/10] overflow-hidden bg-basalt-800" },
                h("img", {
                  src: item.src,
                  alt: lang === "ka" ? item.titleKa : item.titleEn,
                  className: "w-full h-full object-cover",
                  loading: "lazy"
                })
              ),
              h(
                "figcaption",
                { className: "p-5 border-t border-salt-50/10" },
                h(
                  "h2",
                  { className: "font-serif text-lg font-semibold text-salt-50" },
                  lang === "ka" ? item.titleKa : item.titleEn
                ),
                h(
                  "p",
                  { className: "text-xs text-salt-400 mt-0.5" },
                  lang === "ka" ? item.subtitleKa : item.subtitleEn
                )
              )
            )
          )
        ),

        /* Social Video Banner */
        h(
          "div",
          {
            className:
              "p-8 rounded-2xl bg-basalt-900 border border-brass-400/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          },
          h(
            "div",
            { className: "space-y-2 max-w-xl" },
            h(
              "span",
              { className: "text-xs font-semibold text-brass-400" },
              "TERRACE LIVE • INSTAGRAM & FACEBOOK"
            ),
            h(
              "h2",
              { className: "font-serif text-2xl sm:text-3xl font-semibold text-salt-50" },
              lang === "ka"
                ? "უყურეთ ცოცხალი მუსიკისა და საღამოს წვეულებების ვიდეოებს"
                : "Watch Live Terrace Sessions & Evening Reels"
            )
          ),
          h(
            "div",
            { className: "flex flex-wrap gap-3" },
            h(
              "a",
              {
                href: RESTAURANT_INFO.instagramUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className:
                  "min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-sm"
              },
              "Instagram (@salt_restaurant_)"
            ),
            h(
              "a",
              {
                href: RESTAURANT_INFO.facebookUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className:
                  "min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-md bg-basalt-950 border border-salt-50/15 text-salt-50 text-sm"
              },
              "Facebook"
            ),
            h(
              "button",
              {
                type: "button",
                onClick: () => openReservationModal(),
                className:
                  "min-h-[44px] px-5 py-2.5 rounded-md bg-basalt-950 border border-brass-400/40 text-brass-300 text-sm cursor-pointer"
              },
              lang === "ka" ? "მაგიდის დაჯავშნა" : "Book a Table"
            )
          )
        )
      ),

      /* Lightbox Modal */
      currentLightboxItem &&
        h(
          "div",
          {
            className:
              "fixed inset-0 z-50 bg-basalt-950/95 backdrop-blur-md flex items-center justify-center p-4",
            role: "dialog",
            "aria-modal": "true",
            onClick: (e) => {
              if (e.target === e.currentTarget) setLightboxIndex(null);
            }
          },
          h(
            "div",
            { className: "max-w-5xl w-full space-y-4" },
            h(
              "div",
              { className: "flex items-center justify-between text-sm text-salt-300" },
              h(
                "span",
                { className: "tabular-nums" },
                `${lightboxIndex + 1} / ${visibleItems.length}`
              ),
              h(
                "button",
                {
                  type: "button",
                  onClick: () => setLightboxIndex(null),
                  className:
                    "min-h-[40px] px-4 py-1.5 rounded-md bg-basalt-900 border border-salt-50/20 text-salt-50 cursor-pointer"
                },
                lang === "ka" ? "დახურვა" : "Close"
              )
            ),
            h(
              "div",
              {
                className:
                  "relative rounded-xl overflow-hidden border border-salt-50/15 bg-basalt-900"
              },
              h("img", {
                src: currentLightboxItem.src,
                alt:
                  lang === "ka"
                    ? currentLightboxItem.titleKa
                    : currentLightboxItem.titleEn,
                className: "w-full object-contain mx-auto",
                style: { maxHeight: "70vh" }
              })
            )
          )
        )
    );
  }

  function ReserveContactView({
    lang,
    preselectedZone,
    preselectedNotes,
    tastingList
  }) {
    return h(
      "div",
      { className: "py-12 lg:py-20 bg-basalt-950 min-h-screen" },
      h(
        "div",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 space-y-16" },
        h(
          "div",
          { className: "border-b border-salt-50/10 pb-8 max-w-3xl space-y-3" },
          h(
            "span",
            { className: "text-xs font-semibold tracking-wider text-brass-400" },
            lang === "ka"
              ? "მაგიდის დაჯავშნა და მდებარეობა • სააკაძის დაღმართი 11"
              : "RESERVATIONS & LOCATION • 11 SAAKADZE DESCENT"
          ),
          h(
            "h1",
            { className: "font-serif text-4xl sm:text-5xl font-semibold text-salt-50" },
            lang === "ka"
              ? "დაჯავშნეთ მაგიდა ან დაგვიკავშირდით"
              : "Reserve Your Table & Find Us in Tbilisi"
          ),
          h(
            "p",
            { className: "text-salt-300 text-base" },
            lang === "ka"
              ? "აირჩიეთ ღია პანორამული ტერასა, მარმარილოს ბარი ან შიდა დარბაზი. გვეწვიეთ გიორგი სააკაძის დაღმართის 11-ში, Kani Aesthetics-ის შენობის მე-7 სართულზე."
              : "Book a table on our 7th-floor open panoramic terrace, at the marble mixology bar, or in the indoor lounge at 11 Giorgi Saakadze Descent."
          )
        ),

        h(
          "div",
          { className: "grid grid-cols-1 lg:grid-cols-12 gap-10 items-start" },
          h(
            "div",
            {
              className:
                "lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-basalt-900 border border-salt-50/15 space-y-6"
            },
            h(
              "div",
              { className: "border-b border-salt-50/10 pb-4" },
              h(
                "h2",
                { className: "font-serif text-2xl sm:text-3xl font-semibold text-salt-50" },
                lang === "ka" ? "ონლაინ დაჯავშნის ფორმა" : "Online Table Reservation"
              )
            ),
            h(ReservationForm, {
              lang,
              preselectedZone,
              preselectedNotes,
              tastingList,
              compact: false
            })
          ),

          h(
            "div",
            { className: "lg:col-span-5 space-y-6" },
            h(
              "div",
              {
                className:
                  "p-6 sm:p-8 rounded-2xl bg-basalt-900 border border-salt-50/15 space-y-6"
              },
              h(
                "h2",
                { className: "font-serif text-2xl font-semibold text-salt-50" },
                lang === "ka" ? "საკონტაქტო ინფორმაცია" : "Direct Contact & Address"
              ),
              h(
                "dl",
                { className: "space-y-4 text-sm" },
                h(
                  "div",
                  { className: "pb-4 border-b border-salt-50/10" },
                  h(
                    "dt",
                    { className: "text-xs text-salt-400 mb-1" },
                    lang === "ka" ? "მისამართი" : "Address"
                  ),
                  h(
                    "dd",
                    { className: "text-salt-50 font-medium" },
                    lang === "ka"
                      ? "გიორგი სააკაძის დაღმართი 11, მე-7 სართული (Kani Aesthetics-ის შენობა), თბილისი 0136"
                      : "11 Giorgi Saakadze Descent, 7th Floor (Kani Aesthetics Building), Tbilisi 0136"
                  )
                ),
                h(
                  "div",
                  { className: "pb-4 border-b border-salt-50/10" },
                  h(
                    "dt",
                    { className: "text-xs text-salt-400 mb-1" },
                    lang === "ka" ? "სამუშაო საათები" : "Opening Hours"
                  ),
                  h(
                    "dd",
                    { className: "text-salt-50 font-medium tabular-nums" },
                    lang === "ka"
                      ? "ყოველდღე: 12:00 – 01:00 (ბიზნეს ლანჩი: 12:00 – 16:00)"
                      : "Daily: 12:00 – 01:00 (Business Lunch: 12:00 – 16:00)"
                  )
                ),
                h(
                  "div",
                  { className: "pb-4 border-b border-salt-50/10" },
                  h(
                    "dt",
                    { className: "text-xs text-salt-400 mb-1" },
                    lang === "ka" ? "ტელეფონი" : "Phone"
                  ),
                  h(
                    "dd",
                    { className: "tabular-nums" },
                    h(
                      "a",
                      {
                        href: `tel:${RESTAURANT_INFO.phoneRaw}`,
                        className: "text-lg font-semibold text-brass-400 hover:underline"
                      },
                      RESTAURANT_INFO.phone
                    )
                  )
                ),
                h(
                  "div",
                  null,
                  h(
                    "dt",
                    { className: "text-xs text-salt-400 mb-1" },
                    lang === "ka" ? "ელ-ფოსტა" : "Email"
                  ),
                  h(
                    "dd",
                    null,
                    h(
                      "a",
                      {
                        href: `mailto:${RESTAURANT_INFO.email}`,
                        className: "text-salt-200 hover:text-brass-400 underline"
                      },
                      RESTAURANT_INFO.email
                    )
                  )
                )
              ),
              h(
                "div",
                { className: "pt-2 flex flex-wrap gap-3" },
                h(
                  "a",
                  {
                    href: RESTAURANT_INFO.googleMapsUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className:
                      "flex-1 min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-sm text-center"
                  },
                  lang === "ka" ? "Google Maps-ში გახსნა" : "Open in Google Maps"
                ),
                h(
                  "a",
                  {
                    href: RESTAURANT_INFO.instagramUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className:
                      "min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-basalt-950 border border-salt-50/15 hover:border-brass-400 text-salt-50 text-sm font-medium"
                  },
                  "Instagram"
                )
              )
            ),

            h(
              "div",
              {
                className:
                  "rounded-2xl overflow-hidden border border-salt-50/15 bg-basalt-900"
              },
              h(
                "div",
                {
                  className:
                    "p-4 border-b border-salt-50/10 flex items-center justify-between text-xs"
                },
                h(
                  "span",
                  { className: "font-medium text-salt-50" },
                  "Salt Restaurant | Terrace & Bar — Google Maps"
                ),
                h(
                  "span",
                  { className: "text-brass-400 font-semibold tabular-nums" },
                  `★ ${RESTAURANT_INFO.rating}`
                )
              ),
              h("iframe", {
                title: "Salt Restaurant Tbilisi Google Map",
                src: RESTAURANT_INFO.googleMapsEmbed,
                className: "w-full h-80 border-0",
                loading: "lazy"
              })
            )
          )
        )
      )
    );
  }

  /* ========================================================================
     4. ROOT APP SHELL (Header, Multi-Page Router, Footer, Modal)
     ======================================================================== */
  function getRouteFromHash() {
    const raw = window.location.hash.replace(/^#/, "") || "/";
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  function App() {
    const [lang, setLang] = useState("ka");
    const [route, setRoute] = useState(getRouteFromHash());
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
    const [preselectedZone, setPreselectedZone] = useState("terrace");
    const [preselectedNotes, setPreselectedNotes] = useState("");
    const [tastingList, setTastingList] = useState([]);

    useEffect(() => {
      const onHashChange = () => {
        setRoute(getRouteFromHash());
        setMobileOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
      window.addEventListener("hashchange", onHashChange);
      return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    useEffect(() => {
      document.documentElement.lang = lang;
    }, [lang]);

    const navigate = (path) => {
      window.location.hash = path;
      setRoute(path);
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openReservationModal = (opts = {}) => {
      if (opts.zone) setPreselectedZone(opts.zone);
      if (opts.notes !== undefined) setPreselectedNotes(opts.notes);
      setIsReserveModalOpen(true);
    };

    const toggleTastingItem = (item) => {
      setTastingList((prev) => {
        const exists = prev.some((i) => i.id === item.id);
        return exists ? prev.filter((i) => i.id !== item.id) : [...prev, item];
      });
    };

    const navItems = [
      { path: "/", labelKa: "მთავარი", labelEn: "Home" },
      {
        path: "/menu",
        labelKa: "მენიუ & ბარი",
        labelEn: "Menu & Bar",
        badge: tastingList.length || null
      },
      {
        path: "/terrace-events",
        labelKa: "ტერასა & ივენთები",
        labelEn: "Terrace & Events"
      },
      { path: "/gallery", labelKa: "გალერეა", labelEn: "Gallery" },
      {
        path: "/reserve",
        labelKa: "დაჯავშნა & კონტაქტი",
        labelEn: "Reserve & Contact"
      }
    ];

    let pageView = null;
    if (route === "/menu") {
      pageView = h(MenuView, {
        lang,
        tastingList,
        toggleTastingItem,
        clearTastingList: () => setTastingList([]),
        openReservationModal
      });
    } else if (route === "/terrace-events") {
      pageView = h(TerraceEventsView, { lang, openReservationModal });
    } else if (route === "/gallery") {
      pageView = h(GalleryView, { lang, openReservationModal });
    } else if (route === "/reserve") {
      pageView = h(ReserveContactView, {
        lang,
        preselectedZone,
        preselectedNotes,
        tastingList
      });
    } else {
      pageView = h(HomeView, { lang, navigate, openReservationModal });
    }

    return h(
      "div",
      { className: "min-h-screen flex flex-col bg-basalt-950 text-salt-50 font-sans" },

      /* Sticky Header */
      h(
        "header",
        {
          className:
            "sticky top-0 z-50 bg-basalt-950/90 backdrop-blur-md border-b border-salt-50/10"
        },
        /* Top Info Strip */
        h(
          "div",
          {
            className:
              "hidden md:block border-b border-salt-50/10 bg-basalt-900/70 text-xs text-salt-300"
          },
          h(
            "div",
            { className: "max-w-7xl mx-auto px-6 h-9 flex items-center justify-between" },
            h(
              "div",
              { className: "flex items-center gap-6" },
              h(
                "span",
                { className: "tabular-nums" },
                lang === "ka"
                  ? "● ღიაა ყოველდღე • 12:00 – 01:00"
                  : "● Open Daily • 12:00 – 01:00"
              ),
              h(
                "span",
                null,
                lang === "ka"
                  ? "გ. სააკაძის დაღმართი 11, მე-7 სართული, თბილისი"
                  : "11 G. Saakadze Descent, 7th Floor, Tbilisi"
              )
            ),
            h(
              "div",
              { className: "flex items-center gap-6" },
              h(
                "a",
                {
                  href: RESTAURANT_INFO.googleMapsUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "hover:text-brass-400 transition-colors tabular-nums"
                },
                `★ ${RESTAURANT_INFO.rating} Google Maps`
              ),
              h(
                "a",
                {
                  href: `tel:${RESTAURANT_INFO.phoneRaw}`,
                  className: "hover:text-brass-400 font-medium text-salt-50 tabular-nums"
                },
                RESTAURANT_INFO.phone
              )
            )
          )
        ),

        /* Main Nav Bar */
        h(
          "div",
          {
            className:
              "max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4"
          },
          h(
            "a",
            {
              href: "#/",
              onClick: (e) => {
                e.preventDefault();
                navigate("/");
              },
              className: "flex flex-col"
            },
            h(
              "span",
              {
                className:
                  "font-serif text-2xl sm:text-3xl font-bold tracking-[0.18em] text-salt-50"
              },
              "SALT"
            ),
            h(
              "span",
              { className: "text-xs tracking-[0.14em] text-brass-400" },
              lang === "ka" ? "რესტორანი • ტერასა & ბარი" : "RESTAURANT • TERRACE & BAR"
            )
          ),

          /* Desktop Nav Links */
          h(
            "nav",
            { className: "hidden lg:flex items-center gap-1", "aria-label": "Main Navigation" },
            navItems.map((item) => {
              const isActive = route === item.path;
              return h(
                "a",
                {
                  key: item.path,
                  href: `#${item.path}`,
                  onClick: (e) => {
                    e.preventDefault();
                    navigate(item.path);
                  },
                  className: `px-3.5 py-2.5 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? "text-brass-300 bg-brass-400/15 border border-brass-400/30"
                      : "text-salt-300 hover:text-salt-50"
                  }`
                },
                h(
                  "span",
                  { className: "inline-flex items-center gap-2" },
                  h("span", null, lang === "ka" ? item.labelKa : item.labelEn),
                  item.badge &&
                    h(
                      "span",
                      {
                        className:
                          "px-2 py-0.5 text-xs font-bold rounded-full bg-brass-400 text-basalt-950 tabular-nums"
                      },
                      item.badge
                    )
                )
              );
            })
          ),

          /* Right Actions */
          h(
            "div",
            { className: "flex items-center gap-2.5" },
            h(
              "button",
              {
                type: "button",
                onClick: () => setLang((prev) => (prev === "ka" ? "en" : "ka")),
                className:
                  "min-h-[44px] px-3 py-2 rounded-md bg-basalt-900 border border-salt-50/15 hover:border-brass-400 text-xs font-semibold cursor-pointer"
              },
              h("span", { className: lang === "ka" ? "text-brass-400" : "text-salt-400" }, "ქარ"),
              h("span", { className: "mx-1 text-salt-400" }, "/"),
              h("span", { className: lang === "en" ? "text-brass-400" : "text-salt-400" }, "ENG")
            ),
            h(
              "button",
              {
                type: "button",
                onClick: () => openReservationModal(),
                className:
                  "hidden sm:inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-md bg-brass-400 hover:bg-brass-300 text-basalt-950 font-semibold text-sm transition-all cursor-pointer"
              },
              lang === "ka" ? "მაგიდის დაჯავშნა" : "Book a Table"
            ),
            h(
              "button",
              {
                type: "button",
                onClick: () => setMobileOpen((prev) => !prev),
                "aria-label": "Toggle Mobile Menu",
                className:
                  "lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md bg-basalt-900 border border-salt-50/15 text-salt-50 cursor-pointer"
              },
              mobileOpen ? "✕" : "☰"
            )
          )
        ),

        /* Mobile Drawer */
        mobileOpen &&
          h(
            "div",
            {
              className:
                "lg:hidden bg-basalt-950 border-t border-salt-50/10 px-4 pt-4 pb-8 space-y-4"
            },
            h(
              "nav",
              { className: "flex flex-col space-y-1" },
              navItems.map((item) => {
                const isActive = route === item.path;
                return h(
                  "a",
                  {
                    key: item.path,
                    href: `#${item.path}`,
                    onClick: (e) => {
                      e.preventDefault();
                      navigate(item.path);
                    },
                    className: `flex items-center justify-between min-h-[48px] px-4 py-3 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-brass-400/15 text-brass-300 border-l-2 border-brass-400"
                        : "text-salt-100"
                    }`
                  },
                  h("span", null, lang === "ka" ? item.labelKa : item.labelEn),
                  item.badge &&
                    h(
                      "span",
                      {
                        className:
                          "px-2 py-0.5 text-xs font-bold rounded-full bg-brass-400 text-basalt-950 tabular-nums"
                      },
                      item.badge
                    )
                );
              })
            ),
            h(
              "button",
              {
                type: "button",
                onClick: () => {
                  setMobileOpen(false);
                  openReservationModal();
                },
                className:
                  "w-full min-h-[48px] py-3 px-5 rounded-md bg-brass-400 text-basalt-950 font-semibold text-base cursor-pointer"
              },
              lang === "ka" ? "მაგიდის დაჯავშნა" : "Book a Table"
            )
          )
      ),

      /* Main Page Content */
      h("main", { id: "main-content", className: "flex-1" }, pageView),

      /* Footer */
      h(
        "footer",
        { className: "bg-basalt-950 border-t border-salt-50/10 text-salt-300" },
        h(
          "div",
          { className: "max-w-7xl mx-auto px-4 sm:px-6 py-16" },
          h(
            "div",
            {
              className:
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-salt-50/10"
            },
            h(
              "div",
              { className: "lg:col-span-5 space-y-4" },
              h(
                "span",
                { className: "font-serif text-3xl font-bold tracking-[0.18em] text-salt-50 block" },
                "SALT"
              ),
              h(
                "p",
                { className: "text-sm text-salt-300 max-w-sm" },
                lang === "ka"
                  ? "მე-7 სართულის პანორამული ტერასა და რესტორანი თბილისში (გიორგი სააკაძის დაღმართი 11). ქართულ-ევროპული სამზარეულო, Liquid Art მიქსოლოგია და ცოცხალი მუსიკა."
                  : "7th-floor panoramic rooftop terrace and restaurant in Tbilisi (11 Giorgi Saakadze Descent). Georgian-European dining, Liquid Art mixology & live music."
              ),
              h(
                "div",
                { className: "flex flex-wrap gap-3 pt-2" },
                h(
                  "a",
                  {
                    href: RESTAURANT_INFO.googleMapsUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className:
                      "inline-flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-md bg-basalt-900 border border-salt-50/15 hover:border-brass-400 text-xs font-medium text-salt-50"
                  },
                  `★ ${RESTAURANT_INFO.rating} Google Maps`
                ),
                h(
                  "a",
                  {
                    href: RESTAURANT_INFO.instagramUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className:
                      "inline-flex items-center min-h-[40px] px-3.5 py-1.5 rounded-md bg-basalt-900 border border-salt-50/15 hover:border-brass-400 text-xs font-medium text-salt-50"
                  },
                  "Instagram"
                ),
                h(
                  "a",
                  {
                    href: RESTAURANT_INFO.facebookUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className:
                      "inline-flex items-center min-h-[40px] px-3.5 py-1.5 rounded-md bg-basalt-900 border border-salt-50/15 hover:border-brass-400 text-xs font-medium text-salt-50"
                  },
                  "Facebook"
                )
              )
            ),
            h(
              "div",
              { className: "lg:col-span-4 space-y-3" },
              h(
                "h3",
                { className: "font-serif text-lg font-semibold text-salt-50" },
                lang === "ka" ? "მრავალგვერდიანი ნავიგაცია" : "Pages"
              ),
              h(
                "ul",
                { className: "space-y-2 text-sm" },
                navItems.map((item) =>
                  h(
                    "li",
                    { key: item.path },
                    h(
                      "a",
                      {
                        href: `#${item.path}`,
                        onClick: (e) => {
                          e.preventDefault();
                          navigate(item.path);
                        },
                        className: "hover:text-brass-400 transition-colors"
                      },
                      lang === "ka" ? item.labelKa : item.labelEn
                    )
                  )
                )
              )
            ),
            h(
              "div",
              { className: "lg:col-span-3 space-y-3" },
              h(
                "h3",
                { className: "font-serif text-lg font-semibold text-salt-50" },
                lang === "ka" ? "კონტაქტი" : "Contact"
              ),
              h(
                "p",
                { className: "text-sm" },
                lang === "ka"
                  ? "გიორგი სააკაძის დაღმართი 11, მე-7 სართული, თბილისი"
                  : "11 Giorgi Saakadze Descent, 7th Floor, Tbilisi"
              ),
              h(
                "p",
                { className: "text-sm tabular-nums text-brass-400 font-semibold" },
                RESTAURANT_INFO.phone
              ),
              h(
                "p",
                { className: "text-xs text-salt-400 tabular-nums" },
                lang === "ka" ? "ყოველდღე: 12:00 – 01:00" : "Daily: 12:00 – 01:00"
              )
            )
          ),
          h(
            "div",
            {
              className:
                "pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-salt-400"
            },
            h(
              "p",
              null,
              lang === "ka"
                ? "© 2026 Salt Restaurant | Terrace & Bar Tbilisi. ყველა უფლება დაცულია."
                : "© 2026 Salt Restaurant | Terrace & Bar Tbilisi. All rights reserved."
            ),
            h(
              "p",
              { className: "tabular-nums" },
              lang === "ka"
                ? "საშუალო ჩეკი: ₾50–₾60 • პანორამული ტერასა მე-7 სართულზე"
                : "Average spend: ₾50–₾60 • 7th-Floor Rooftop"
            )
          )
        )
      ),

      /* Global Reservation Modal */
      isReserveModalOpen &&
        h(
          "div",
          {
            className:
              "fixed inset-0 z-50 flex items-center justify-center p-4 bg-basalt-950/85 backdrop-blur-md overflow-y-auto",
            role: "dialog",
            "aria-modal": "true",
            onClick: (e) => {
              if (e.target === e.currentTarget) setIsReserveModalOpen(false);
            }
          },
          h(
            "div",
            {
              className:
                "relative w-full max-w-2xl rounded-xl bg-basalt-900 border border-salt-50/15 p-6 sm:p-8"
            },
            h(
              "div",
              {
                className:
                  "flex items-start justify-between gap-4 pb-4 mb-5 border-b border-salt-50/10"
              },
              h(
                "div",
                null,
                h(
                  "span",
                  { className: "text-xs font-medium text-brass-400" },
                  "SALT TERRACE & BAR • 7TH FLOOR"
                ),
                h(
                  "h2",
                  { className: "font-serif text-2xl sm:text-3xl font-semibold text-salt-50" },
                  lang === "ka" ? "მაგიდის დაჯავშნა" : "Reserve Your Table"
                )
              ),
              h(
                "button",
                {
                  type: "button",
                  onClick: () => setIsReserveModalOpen(false),
                  className:
                    "w-11 h-11 rounded-md bg-basalt-950 border border-salt-50/15 text-salt-300 hover:text-salt-50 text-xl cursor-pointer"
                },
                "×"
              )
            ),
            h(ReservationForm, {
              lang,
              preselectedZone,
              preselectedNotes,
              tastingList,
              compact: true,
              onSuccessClose: () => setIsReserveModalOpen(false)
            })
          )
        )
    );
  }

  const rootEl = document.getElementById("root");
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(h(App));
  }
})();
