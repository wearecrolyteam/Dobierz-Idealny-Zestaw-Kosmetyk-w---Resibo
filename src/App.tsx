import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Info, Check, Share2, Download, Mail, Code, X, Sparkles, Droplets, Sun, Moon, Wind, Shield, Leaf, Smile, Star, Copy, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- DATA ---

const BRAND_NAME = "Resibo";

type Option = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
};

type Question = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi';
  options: Option[];
  maxSelect?: number;
  tooltip?: string;
};

const QUESTIONS: Question[] = [
  {
    id: 'skinType',
    title: 'Jaki jest Twój typ cery?',
    subtitle: 'Wybierz jedną opcję, która najlepiej opisuje Twoją skórę na co dzień.',
    type: 'single',
    tooltip: 'Typ cery to podstawa doboru odpowiedniej bazy pielęgnacyjnej (np. kremu czy żelu myjącego).',
    options: [
      { id: 'sucha', label: 'Sucha', description: 'Często napięta, szorstka, brakuje jej blasku.', icon: <Wind className="w-5 h-5" /> },
      { id: 'tlusta', label: 'Tłusta', description: 'Szybko się wyświeca, widoczne pory, skłonność do wyprysków.', icon: <Droplets className="w-5 h-5" /> },
      { id: 'mieszana', label: 'Mieszana', description: 'Tłusta w strefie T (czoło, nos, broda), sucha na policzkach.', icon: <Sun className="w-5 h-5" /> },
      { id: 'normalna', label: 'Normalna', description: 'Zbalansowana, bez większych problemów.', icon: <Smile className="w-5 h-5" /> },
      { id: 'wrazliwa', label: 'Wrażliwa', description: 'Reaguje zaczerwienieniem, pieczeniem na kosmetyki lub zmiany temperatur.', icon: <Shield className="w-5 h-5" /> },
    ]
  },
  {
    id: 'concerns',
    title: 'Jakie są Twoje główne wyzwania skórne?',
    subtitle: 'Wybierz maksymalnie 3 problemy, na których chcesz się skupić.',
    type: 'multi',
    maxSelect: 3,
    tooltip: 'Skupienie się na 2-3 głównych problemach pozwala na dobór najskuteczniejszych składników aktywnych bez przeciążania skóry.',
    options: [
      { id: 'tradzik', label: 'Trądzik i niedoskonałości', icon: <Droplets className="w-5 h-5" /> },
      { id: 'przebarwienia', label: 'Przebarwienia', icon: <Sun className="w-5 h-5" /> },
      { id: 'zmarszczki', label: 'Pierwsze zmarszczki / utrata jędrności', icon: <Star className="w-5 h-5" /> },
      { id: 'przesuszenie', label: 'Silne przesuszenie', icon: <Wind className="w-5 h-5" /> },
      { id: 'zaczerwienienia', label: 'Zaczerwienienia i naczynka', icon: <Shield className="w-5 h-5" /> },
      { id: 'brak_blasku', label: 'Szara cera, brak blasku', icon: <Sparkles className="w-5 h-5" /> },
    ]
  },
  {
    id: 'ingredients',
    title: 'Czy masz preferowane składniki aktywne?',
    subtitle: 'Zaznacz, jeśli szukasz konkretnych substancji w swoich kosmetykach.',
    type: 'multi',
    tooltip: 'Niektóre składniki, jak kozieradka czy granat, mają udowodnione działanie w konkretnych problemach (np. wypadanie włosów, antyoksydacja).',
    options: [
      { id: 'kozieradka', label: 'Kozieradka', description: 'Wzmocnienie włosów i stymulacja wzrostu', icon: <Leaf className="w-5 h-5" /> },
      { id: 'granat', label: 'Granat (owoc)', description: 'Silna antyoksydacja i regeneracja', icon: <Leaf className="w-5 h-5" /> },
      { id: 'witamina_c', label: 'Witamina C', description: 'Rozświetlenie i wyrównanie kolorytu', icon: <Leaf className="w-5 h-5" /> },
      { id: 'ceramidy', label: 'Ceramidy', description: 'Odbudowa bariery hydrolipidowej', icon: <Leaf className="w-5 h-5" /> },
      { id: 'kwas_hialuronowy', label: 'Kwas hialuronowy', description: 'Głębokie nawilżenie', icon: <Leaf className="w-5 h-5" /> },
    ]
  },
  {
    id: 'routineTime',
    title: 'Ile czasu rano poświęcasz na pielęgnację?',
    subtitle: 'Wybierz swój styl dbania o siebie.',
    type: 'single',
    tooltip: 'Czas determinuje ilość kroków w rutynie. Minimalistkom polecamy produkty wielofunkcyjne, np. krem bb.',
    options: [
      { id: 'minimalistka', label: 'Minimalistka (2-3 min)', description: 'Szybkie oczyszczenie i krem/SPF. Szukam produktów 2w1.' },
      { id: 'standard', label: 'Standard (5 min)', description: 'Oczyszczanie, tonik, serum, krem. Podstawowa, skuteczna rutyna.' },
      { id: 'rytual', label: 'Rytuał (10+ min)', description: 'Uwielbiam wieloetapową pielęgnację i masaże twarzy.' },
    ]
  },
  {
    id: 'texture',
    title: 'Jakiej konsystencji kosmetyków szukasz?',
    subtitle: 'Wybierz formułę, która jest dla Ciebie najprzyjemniejsza.',
    type: 'single',
    tooltip: 'Konsystencja wpływa na komfort stosowania. Skóry tłuste wolą żele, suche - bogate kremy i olejki.',
    options: [
      { id: 'lekkie', label: 'Lekkie, żelowe, szybko wchłaniające się' },
      { id: 'bogate', label: 'Bogate, kremowe, otulające' },
      { id: 'olejkowe', label: 'Olejkowe, odżywcze, idealne do masażu' },
    ]
  },
  {
    id: 'missing',
    title: 'Czego najbardziej brakuje w Twojej kosmetyczce?',
    subtitle: 'Wybierz produkty, których aktualnie poszukujesz.',
    type: 'multi',
    tooltip: 'Pomoże nam to skupić się na produktach, których faktycznie potrzebujesz, zamiast dublować Twoje zapasy.',
    options: [
      { id: 'oczyszczanie', label: 'Demakijaż i oczyszczanie' },
      { id: 'tonizacja', label: 'Tonizacja / Esencja' },
      { id: 'serum', label: 'Skoncentrowane serum' },
      { id: 'krem_dzien', label: 'Krem na dzień (np. krem bb)' },
      { id: 'krem_noc', label: 'Krem na noc' },
      { id: 'wlosy', label: 'Pielęgnacja włosów' },
    ]
  }
];

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  reason: string;
  imageUrl: string;
  price: string;
  url: string;
  match: (ans: Record<string, string | string[]>) => boolean;
};

const PRODUCTS: Product[] = [
  {
    id: 'bb_cream',
    name: 'Self Love. Krem BB',
    category: 'Krem na dzień',
    description: 'Lekki krem koloryzujący, który nawilża, koi i wyrównuje koloryt. Idealny na szybki poranek.',
    imageUrl: 'https://resibo.pl/2128-large_default/self-love-krem-bb.jpg',
    price: '62,30 zł',
    url: 'https://resibo.pl/produkt/229/self-love-krem-bb',
    match: (ans) => (ans.missing as string[]).includes('krem_dzien') || ans.routineTime === 'minimalistka',
    reason: 'Szukasz szybkiego rozwiązania na dzień. Krem BB łączy pielęgnację z delikatnym makijażem, oszczędzając Twój czas.'
  },
  {
    id: 'wcierka_kozieradka',
    name: 'Hello New One - Wcierka pobudzająca porost włosów',
    category: 'Włosy',
    description: 'Skoncentrowana wcierka z ekstraktem z kozieradki. Wzmacnia cebulki i stymuluje porost tzw. baby hair.',
    imageUrl: 'https://resibo.pl/2389-large_default/hello-new-one-wcierka-pobudzajaca-porost-wlosow.jpg',
    price: '48,30 zł',
    url: 'https://resibo.pl/produkt/263/hello-new-one-wcierka-pobudzajaca-porost-wlosow',
    match: (ans) => (ans.ingredients as string[]).includes('kozieradka') || (ans.missing as string[]).includes('wlosy'),
    reason: 'Zaznaczyłaś zainteresowanie kozieradką lub pielęgnacją włosów. Ta wcierka to nasz bestseller na wzmocnienie cebulek.'
  },
  {
    id: 'serum_granat',
    name: 'Serum naturalnie wygładzające',
    category: 'Serum',
    description: 'Potężna dawka antyoksydantów z ekstraktem z owocu granatu. Chroni przed starzeniem i przywraca blask.',
    imageUrl: 'https://resibo.pl/2441-large_default/resibo-serum-naturalnie-wygladzajace-30ml.jpg',
    price: '104,30 zł',
    url: 'https://resibo.pl/produkt/252/resibo-serum-naturalnie-wygladzajace-30ml',
    match: (ans) => (ans.ingredients as string[]).includes('granat') || (ans.concerns as string[]).includes('brak_blasku') || (ans.concerns as string[]).includes('zmarszczki'),
    reason: 'Ekstrakt z granatu to silny antyoksydant, idealny do walki z pierwszymi oznakami starzenia i szarą cerą.'
  },
  {
    id: 'olejek_demakijaz',
    name: 'Oily One - Olejek do demakijażu',
    category: 'Oczyszczanie',
    description: 'Rozpuszcza makijaż i zanieczyszczenia, nie naruszając bariery hydrolipidowej. Idealny do masażu.',
    imageUrl: 'https://resibo.pl/1963-large_default/oily-one-olejek-do-demakijazu.jpg',
    price: '69,30 zł',
    url: 'https://resibo.pl/produkt/228/oily-one-olejek-do-demakijazu',
    match: (ans) => (ans.missing as string[]).includes('oczyszczanie') && (ans.texture === 'olejkowe' || ans.routineTime === 'rytual'),
    reason: 'Szukasz produktu do oczyszczania w formie olejkowej. To idealny wybór do wieczornego rytuału i masażu twarzy.'
  },
  {
    id: 'zel_brzoskwinia',
    name: 'Naturalny żel myjący z ekstraktem z brzoskwini',
    category: 'Oczyszczanie',
    description: 'Delikatnie, ale skutecznie oczyszcza skórę. Pozostawia ją świeżą i gotową na kolejne kroki.',
    imageUrl: 'https://resibo.pl/2597-large_default/resibo-naturalny-zel-myjacy-do-twarzy-z-ekstraktem-z-brzoskwini-250ml.jpg',
    price: '41,30 zł',
    url: 'https://resibo.pl/produkt/379/resibo-naturalny-zel-myjacy-do-twarzy-z-ekstraktem-z-brzoskwini-250ml',
    match: (ans) => (ans.missing as string[]).includes('oczyszczanie') && (ans.texture === 'lekkie' || ['tlusta', 'mieszana'].includes(ans.skinType as string)),
    reason: 'Lekka, żelowa formuła idealnie sprawdzi się przy Twoim typie cery, zapewniając uczucie świeżości bez ściągnięcia.'
  },
  {
    id: 'tonik_mr_balance',
    name: 'Moist Have - Tonik esencja nawilżająca',
    category: 'Tonizacja',
    description: 'Przywraca naturalne pH skóry, nawilża i przygotowuje na przyjęcie składników aktywnych.',
    imageUrl: 'https://resibo.pl/2302-large_default/moist-have-tonik-esencja-nawilzajaca.jpg',
    price: '55,30 zł',
    url: 'https://resibo.pl/produkt/277/moist-have-tonik-esencja-nawilzajaca',
    match: (ans) => (ans.missing as string[]).includes('tonizacja'),
    reason: 'Tonizacja to kluczowy krok, którego szukasz. Ten tonik przywróci skórze odpowiednie pH i głębokie nawilżenie.'
  },
  {
    id: 'krem_rescue',
    name: 'Instant Barrier - Krem regenerujący barierę',
    category: 'Krem na noc',
    description: 'Bogaty krem ratunkowy. Odbudowuje barierę hydrolipidową, silnie nawilża i koi.',
    imageUrl: 'https://resibo.pl/2397-large_default/instant-barrier-krem-regenerujacy-bariere-hydrolipidowa.jpg',
    price: '55,30 zł',
    url: 'https://resibo.pl/produkt/336/instant-barrier-krem-regenerujacy-bariere-hydrolipidowa',
    match: (ans) => (ans.skinType === 'sucha' || ans.skinType === 'wrazliwa' || (ans.concerns as string[]).includes('przesuszenie')) && ((ans.missing as string[]).includes('krem_noc') || ans.texture === 'bogate'),
    reason: 'Twoja skóra potrzebuje silnego odżywienia i regeneracji. Bogata konsystencja tego kremu zadziała jak kompres.'
  },
  {
    id: 'serum_glow',
    name: 'Cup of C - Rozświetlające serum z witaminą C',
    category: 'Serum',
    description: 'Wyrównuje koloryt, rozjaśnia przebarwienia i dodaje skórze naturalnego blasku.',
    imageUrl: 'https://resibo.pl/2192-large_default/cup-of-c-rozswietlajace-serum-z-witamina-c.jpg',
    price: '55,30 zł',
    url: 'https://resibo.pl/produkt/328/cup-of-c-rozswietlajace-serum-z-witamina-c',
    match: (ans) => (ans.ingredients as string[]).includes('witamina_c') || (ans.concerns as string[]).includes('przebarwienia') || (ans.concerns as string[]).includes('brak_blasku'),
    reason: 'Witamina C to najlepszy wybór na przebarwienia i brak blasku, z którymi się zmagasz.'
  },
  {
    id: 'krem_sos',
    name: 'Velvet Blur - Krem zmniejszający widoczność porów',
    category: 'Krem specjalistyczny',
    description: 'Błyskawicznie wygładza, matuje i zmniejsza widoczność porów.',
    imageUrl: 'https://resibo.pl/2812-large_default/velvet-blur-utralekki-krem-zmniejszajacy-widocznosc-porow.jpg',
    price: '38,50 zł',
    url: 'https://resibo.pl/produkt/381/velvet-blur-utralekki-krem-zmniejszajacy-widocznosc-porow',
    match: (ans) => (ans.concerns as string[]).includes('zaczerwienienia') || ans.skinType === 'wrazliwa',
    reason: 'Dla cery wymagającej wygładzenia i ukojenia, ten krem to absolutny must-have.'
  },
  {
    id: 'serum_sebum',
    name: 'Berry Good - Wygładzające serum kwasowe',
    category: 'Serum',
    description: 'Zmniejsza wydzielanie sebum, zwęża pory i zapobiega powstawaniu niedoskonałości.',
    imageUrl: 'https://resibo.pl/2702-large_default/berry-good-wygladzajace-serum-kwasowe-z-kompleksem-ceramidow.jpg',
    price: '83,30 zł',
    url: 'https://resibo.pl/produkt/398/berry-good-wygladzajace-serum-kwasowe-z-kompleksem-ceramidow',
    match: (ans) => (ans.concerns as string[]).includes('tradzik') || ['tlusta', 'mieszana'].includes(ans.skinType as string),
    reason: 'Twoja cera skłonna do niedoskonałości potrzebuje regulacji wydzielania sebum, co zapewni to serum kwasowe.'
  }
];

// --- APP COMPONENT ---

export default function App() {
  const [step, setStep] = useState(-1); // -1: Welcome, 0-5: Questions, 6: Analyzing, 7: Results
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    skinType: '',
    concerns: [],
    ingredients: [],
    routineTime: '',
    texture: '',
    missing: []
  });
  
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  const [direction, setDirection] = useState(1);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('embed') === 'true') {
      setIsEmbedded(true);
    }
  }, []);

  const handleNext = () => {
    if (step === QUESTIONS.length - 1) {
      setDirection(1);
      setStep(step + 1); // Go to analyzing
      setTimeout(() => {
        calculateResults();
        setStep(step + 2); // Go to results
      }, 2500);
    } else {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  const handleSelect = (questionId: string, optionId: string, type: 'single' | 'multi', maxSelect?: number) => {
    setAnswers(prev => {
      const current = prev[questionId];
      if (type === 'single') {
        return { ...prev, [questionId]: optionId };
      } else {
        const arr = (current as string[]) || [];
        if (arr.includes(optionId)) {
          return { ...prev, [questionId]: arr.filter(id => id !== optionId) };
        } else {
          if (maxSelect && arr.length >= maxSelect) return prev;
          return { ...prev, [questionId]: [...arr, optionId] };
        }
      }
    });
  };

  const calculateResults = () => {
    let matched = PRODUCTS.filter(p => p.match(answers));
    
    // Ensure we have at least 3 recommendations, fallback to generic ones if needed
    if (matched.length < 3) {
      const fallbacks = PRODUCTS.filter(p => !matched.includes(p)).slice(0, 3 - matched.length);
      matched = [...matched, ...fallbacks];
    }
    
    // Limit to 5-8 recommendations
    matched = matched.slice(0, 6);
    
    setRecommendations(matched);
  };

  const generatePDF = async () => {
    if (!resultsRef.current) return;
    
    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Zestaw_Kosmetykow_${BRAND_NAME}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
    }
  };

  const isNextDisabled = () => {
    if (step < 0 || step >= QUESTIONS.length) return false;
    const q = QUESTIONS[step];
    const ans = answers[q.id];
    return !ans || ans.length === 0;
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const renderSlide = () => {
    if (step === -1) {
      return (
        <div className="flex flex-col h-full w-full bg-white p-8 text-center justify-center items-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-neutral-800" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4 tracking-tight">
            Kreator Zestawu od <span className="text-[#d4a373]">{BRAND_NAME}</span>
          </h1>
          <p className="text-neutral-600 mb-8 max-w-sm text-lg">
            Znajdź spersonalizowany zestaw kosmetyków damskich odpowiadający Twoim potrzebom. Odpowiedz na kilka pytań i odkryj swoją idealną rutynę, w tym krem bb, kosmetyki z kozieradką czy owocem granatu.
          </p>
          <button
            onClick={() => { setDirection(1); setStep(0); }}
            className="w-full max-w-xs bg-neutral-900 text-white py-4 px-6 rounded-xl font-medium text-lg hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-neutral-900/20"
          >
            Rozpocznij analizę
          </button>
          
          <button 
            onClick={() => setShowEduModal(true)}
            className="mt-6 text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors"
          >
            <Info className="w-4 h-4" /> Jak to działa?
          </button>
        </div>
      );
    }

    if (step >= 0 && step < QUESTIONS.length) {
      const q = QUESTIONS[step];
      const currentAnswer = answers[q.id];
      
      return (
        <div className="flex flex-col h-full w-full bg-white">
          {/* Header */}
          <div className="shrink-0 p-6 pb-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Krok {step + 1} z {QUESTIONS.length}
              </span>
              <button onClick={() => setShowEduModal(true)} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <Info className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-100 rounded-full mb-6 overflow-hidden">
              <motion.div 
                className="h-full bg-neutral-900 rounded-full"
                initial={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <h2 className="text-2xl font-bold text-neutral-900 mb-2">{q.title}</h2>
            {q.subtitle && <p className="text-neutral-500 text-sm mb-2">{q.subtitle}</p>}
            
            {/* Tooltip inline */}
            {q.tooltip && (
              <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mb-4">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{q.tooltip}</p>
              </div>
            )}
          </div>

          {/* Options (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
            <div className="flex flex-col gap-3">
              {q.options.map((opt) => {
                const isSelected = q.type === 'single' 
                  ? currentAnswer === opt.id 
                  : (currentAnswer as string[]).includes(opt.id);
                
                const isDisabled = q.type === 'multi' && q.maxSelect 
                  ? !isSelected && (currentAnswer as string[]).length >= q.maxSelect 
                  : false;

                return (
                  <button
                    key={opt.id}
                    disabled={isDisabled}
                    onClick={() => handleSelect(q.id, opt.id, q.type, q.maxSelect)}
                    className={cn(
                      "flex items-center p-4 rounded-xl border-2 text-left transition-all duration-200",
                      isSelected 
                        ? "border-neutral-900 bg-neutral-50 shadow-sm" 
                        : "border-neutral-100 hover:border-neutral-200 bg-white",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {opt.icon && (
                      <div className={cn(
                        "shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4",
                        isSelected ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
                      )}>
                        {opt.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={cn("font-medium", isSelected ? "text-neutral-900" : "text-neutral-700")}>
                        {opt.label}
                      </div>
                      {opt.description && (
                        <div className="text-xs text-neutral-500 mt-1">{opt.description}</div>
                      )}
                    </div>
                    <div className={cn(
                      "shrink-0 w-6 h-6 rounded-full border flex items-center justify-center ml-4 transition-colors",
                      q.type === 'single' ? "rounded-full" : "rounded-md",
                      isSelected ? "bg-neutral-900 border-neutral-900" : "border-neutral-300"
                    )}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="shrink-0 p-6 pt-4 border-t border-neutral-100 bg-white flex justify-between items-center">
            <button
              onClick={handlePrev}
              className="p-3 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={isNextDisabled()}
              className={cn(
                "flex items-center gap-2 py-3 px-6 rounded-xl font-medium transition-all",
                isNextDisabled() 
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" 
                  : "bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 shadow-md"
              )}
            >
              {step === QUESTIONS.length - 1 ? 'Zobacz wyniki' : 'Dalej'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    if (step === QUESTIONS.length) {
      return (
        <div className="flex flex-col h-full w-full bg-white items-center justify-center p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 border-4 border-neutral-100 border-t-neutral-900 rounded-full mb-8"
          />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Analizujemy Twoje odpowiedzi...</h2>
          <p className="text-neutral-500">Dopasowujemy idealne produkty {BRAND_NAME} do Twoich potrzeb.</p>
        </div>
      );
    }

    if (step === QUESTIONS.length + 1) {
      return (
        <div className="flex flex-col h-full w-full bg-white" ref={resultsRef}>
          {/* Results Header */}
          <div className="shrink-0 p-6 pb-4 border-b border-neutral-100 bg-neutral-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-widest text-[#d4a373] uppercase">Twój Zestaw</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">Spersonalizowana rekomendacja od {BRAND_NAME}</h2>
            <p className="text-xs text-neutral-500">
              Na podstawie Twoich odpowiedzi (m m.in. cera {answers.skinType}, cel: {Array.isArray(answers.concerns) ? answers.concerns[0] : ''}) przygotowaliśmy ten zestaw.
            </p>
          </div>

          {/* Results List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 text-xs text-yellow-800 flex gap-3">
              <Info className="w-5 h-5 shrink-0 text-yellow-600" />
              <p><strong>Pamiętaj:</strong> Poniższe rekomendacje to nasze sugestie oparte na algorytmie dopasowania. Traktuj je jako punkt wyjścia do własnych przemyśleń.</p>
            </div>

            <div className="space-y-4">
              {recommendations.map((prod, idx) => (
                <motion.div 
                  key={prod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex gap-4 mb-3">
                    <img src={prod.imageUrl} alt={prod.name} className="w-20 h-20 object-cover rounded-lg border border-neutral-100 shrink-0" referrerPolicy="no-referrer" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{prod.category}</span>
                      <h3 className="font-bold text-neutral-900 leading-tight">{prod.name}</h3>
                      <div className="text-[#d4a373] font-bold mt-1">{prod.price}</div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">{prod.description}</p>
                  <div className="bg-neutral-50 rounded-lg p-3 text-xs text-neutral-700 border border-neutral-100 mb-4">
                    <strong className="block mb-1 text-neutral-900">Dlaczego ten produkt?</strong>
                    {prod.reason}
                  </div>
                  <a 
                    href={prod.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full text-center bg-neutral-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                  >
                    Przejdź do produktu
                  </a>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Results Footer / Actions */}
          <div className="shrink-0 p-4 border-t border-neutral-100 bg-white grid grid-cols-2 gap-3">
            <button 
              onClick={generatePDF}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors text-sm"
            >
              <Download className="w-4 h-4" /> Pobierz PDF
            </button>
            <button 
              onClick={() => {
                setAnswers({ skinType: '', concerns: [], ingredients: [], routineTime: '', texture: '', missing: [] });
                setStep(0);
                setDirection(-1);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Zacznij od nowa
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4 pb-16 font-sans relative">
      
      {/* Main Square Container */}
      <div className="relative w-full max-w-[600px] aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-200">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="absolute inset-0"
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer (Hidden in embed mode) */}
      {!isEmbedded && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <a 
            href="https://wearecroly.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
          >
            Powered by CROly
          </a>
        </div>
      )}

      {/* Embed Button */}
      <button
        onClick={() => setShowEmbedModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full shadow-xl border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:scale-105 transition-all z-50"
        aria-label="Embed code"
      >
        <Code className="w-6 h-6" />
      </button>

      {/* Embed Modal */}
      <AnimatePresence>
        {showEmbedModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-neutral-900">Osadź na swojej stronie</h3>
                <button onClick={() => setShowEmbedModal(false)} className="text-neutral-400 hover:text-neutral-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-neutral-600 mb-4">Skopiuj poniższy kod, aby umieścić ten widget na swoim blogu lub stronie. Widget automatycznie zachowa proporcje 1:1 (kwadrat).</p>
                
                <div className="relative">
                  <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-xl text-xs overflow-x-auto">
{`<div style="max-width: 600px; margin: 0 auto;">
  <iframe 
    src="${window.location.origin}?embed=true" 
    width="100%" 
    style="aspect-ratio: 1/1; border: 1px solid #e5e7eb; border-radius: 16px; display: block;"
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
    loading="lazy">
  </iframe>
  <div style="text-align: center; margin-top: 12px; font-size: 14px;">
    <a href="https://wearecroly.com" target="_blank" rel="noopener" style="color: #6b7280; text-decoration: none;">Powered by CROly</a>
  </div>
</div>`}
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`<div style="max-width: 600px; margin: 0 auto;">\n  <iframe \n    src="${window.location.origin}?embed=true" \n    width="100%" \n    style="aspect-ratio: 1/1; border: 1px solid #e5e7eb; border-radius: 16px; display: block;"\n    frameborder="0" \n    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"\n    loading="lazy">\n  </iframe>\n  <div style="text-align: center; margin-top: 12px; font-size: 14px;">\n    <a href="https://wearecroly.com" target="_blank" rel="noopener" style="color: #6b7280; text-decoration: none;">Powered by CROly</a>\n  </div>\n</div>`);
                      alert('Skopiowano do schowka!');
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Education Modal */}
      <AnimatePresence>
        {showEduModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#d4a373]" /> Jak to działa?
                </h3>
                <button onClick={() => setShowEduModal(false)} className="text-neutral-400 hover:text-neutral-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 text-sm text-neutral-600">
                <div>
                  <strong className="block text-neutral-900 mb-1">CO to jest:</strong>
                  Inteligentny konfigurator pielęgnacji, który dobiera produkty {BRAND_NAME} do Twoich indywidualnych potrzeb.
                </div>
                <div>
                  <strong className="block text-neutral-900 mb-1">JAK to działa:</strong>
                  Odpowiadasz na 6 prostych pytań o Twoją cerę, nawyki i preferencje. Nasz algorytm analizuje Twoje odpowiedzi i dopasowuje optymalne produkty, tworząc spersonalizowaną rutynę.
                </div>
                <div>
                  <strong className="block text-neutral-900 mb-1">DLACZEGO warto:</strong>
                  Oszczędzasz czas i pieniądze, unikając nietrafionych zakupów. Otrzymujesz gotowy plan działania z wyjaśnieniem, dlaczego dany produkt sprawdzi się u Ciebie.
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-yellow-800 mt-4 border border-yellow-100">
                  <strong>Ważne:</strong> To są nasze sugestie oparte na Twoich odpowiedziach. Ostateczna decyzja należy do Ciebie, a w przypadku poważnych problemów skórnych zalecamy konsultację z dermatologiem.
                </div>
              </div>
              <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                <button 
                  onClick={() => setShowEduModal(false)}
                  className="w-full bg-neutral-900 text-white py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors"
                >
                  Zrozumiałem, kontynuuj
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
