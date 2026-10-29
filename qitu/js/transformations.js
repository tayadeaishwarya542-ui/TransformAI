// ================================================================
//  TransformAI — Core Transformation & Local NLP Engine
// ================================================================

const LocalNLP = {
  spellingDict: {
    'teh': 'the', 'recieve': 'receive', 'recieveing': 'receiving', 'recieving': 'receiving', 'recieved': 'received', 'seperate': 'separate', 'definately': 'definitely',
    'occured': 'occurred', 'untill': 'until', 'alot': 'a lot', 'accomodate': 'accommodate',
    'acheive': 'achieve', 'acros': 'across', 'agressive': 'aggressive', 'apparantly': 'apparently',
    'appearence': 'appearance', 'arguement': 'argument', 'basicly': 'basically', 'begining': 'beginning',
    'beleive': 'believe', 'calender': 'calendar', 'catagory': 'category', 'colleague': 'colleague',
    'commited': 'committed', 'concious': 'conscious', 'curiosity': 'curiosity', 'decieve': 'deceive',
    'definate': 'definite', 'dillema': 'dilemma', 'dissapear': 'disappear', 'dissappoint': 'disappoint',
    'embarass': 'embarrass', 'enviroment': 'environment', 'existance': 'existence', 'familar': 'familiar',
    'finaly': 'finally', 'foriegn': 'foreign', 'fourty': 'forty', 'foward': 'forward', 'freind': 'friend',
    'goverment': 'government', 'grammer': 'grammar', 'happend': 'happened', 'harrass': 'harass',
    'heigth': 'height', 'hiearchy': 'hierarchy', 'immediatly': 'immediately', 'independant': 'independent',
    'inteligence': 'intelligence', 'interupt': 'interrupt', 'knowlege': 'knowledge', 'maintanance': 'maintenance',
    'neccessary': 'necessary', 'noticable': 'noticeable', 'occassion': 'occasion', 'oppurtunity': 'opportunity',
    'peice': 'piece', 'priviledge': 'privilege', 'probaly': 'probably', 'pronounciation': 'pronunciation',
    'publically': 'publicly', 'realy': 'really', 'refered': 'referred', 'relavent': 'relevant',
    'succesful': 'successful', 'suprise': 'surprise', 'tommorrow': 'tomorrow', 'truely': 'truly',
    'unfortunatly': 'unfortunately', 'wich': 'which', 'wierd': 'weird', 'writting': 'writing',
    'could of': 'could have', 'should of': 'should have', 'would of': 'would have', 'irregardless': 'regardless'
  },

  simplificationMap: {
    'utilize': 'use', 'utilization': 'use', 'commence': 'start', 'terminate': 'end',
    'facilitate': 'help', 'demonstrate': 'show', 'subsequently': 'later', 'implement': 'set up',
    'implementation': 'setup', 'substantial': 'large', 'fundamental': 'basic', 'endeavor': 'effort',
    'ascertain': 'find out', 'constitutes': 'makes up', 'disseminate': 'share', 'expedite': 'speed up',
    'ameliorate': 'improve', 'cognizant': 'aware', 'delineate': 'describe', 'elucidate': 'explain',
    'fabricate': 'create', 'generate': 'create', 'heterogeneous': 'varied', 'homogeneous': 'uniform',
    'inception': 'start', 'juxtapose': 'compare', 'lucrative': 'profitable', 'manifest': 'show',
    'necessitate': 'require', 'optimal': 'best', 'paramount': 'top priority', 'predominant': 'main',
    'proliferation': 'rapid spread', 'recapitulate': 'summarize', 'remuneration': 'pay',
    'stipulate': 'specify', 'transpire': 'happen', 'unilateral': 'one-sided', 'viable': 'workable',
    'warrant': 'justify', 'in order to': 'to', 'prior to': 'before', 'subsequent to': 'after',
    'in the event that': 'if', 'at this point in time': 'now', 'due to the fact that': 'because',
    'for the purpose of': 'to', 'with the exception of': 'except for', 'in close proximity to': 'near',
    'a large number of': 'many', 'a majority of': 'most'
  },

  toneLexicon: {
    professional: {
      'good': 'effective', 'bad': 'suboptimal', 'make': 'establish', 'big': 'substantial',
      'help': 'assist', 'fix': 'resolve', 'tell': 'inform', 'get': 'acquire', 'start': 'initiate',
      'buy': 'procure', 'talk': 'consult', 'ask': 'inquire', 'show': 'demonstrate', 'problem': 'challenge'
    },
    formal: {
      "can't": "cannot", "won't": "will not", "didn't": "did not", "don't": "do not",
      "isn't": "is not", "aren't": "are not", "wasn't": "was not", "weren't": "were not",
      "haven't": "have not", "hasn't": "has not", "it's": "it is", "they're": "they are",
      "we're": "we are", "you're": "you are", "i'm": "I am", 'good': 'satisfactory',
      'bad': 'unfavorable', 'maybe': 'perhaps', 'kid': 'child', 'cool': 'favorable'
    },
    casual: {
      'furthermore': 'also', 'subsequently': 'then', 'in conclusion': 'so basically',
      'demonstrates': 'shows', 'utilize': 'use', 'assist': 'help', 'inquire': 'ask',
      'regarding': 'about', 'however': 'but', 'nevertheless': 'still', 'commence': 'kick off'
    },
    friendly: {
      'please note': 'just so you know', 'regards': 'warmly', 'sincerely': 'cheers',
      'inform': 'let you know', 'require': 'need', 'assist': 'lend a hand', 'optimal': 'great'
    },
    persuasive: {
      'good': 'proven', 'new': 'groundbreaking', 'effective': 'transformative',
      'important': 'critical', 'helpful': 'indispensable', 'useful': 'high-impact',
      'possible': 'achievable', 'fast': 'rapid'
    },
    academic: {
      'shows': 'substantiates', 'thinks': 'posits', 'because': 'attributable to the fact that',
      'in fact': 'empirically observed', 'good': 'salient', 'many': 'numerous',
      'look at': 'examine', 'about': 'concerning'
    },
    creative: {
      'bright': 'radiant', 'dark': 'shadowed', 'said': 'murmured', 'fast': 'like lightning',
      'big': 'colossal', 'small': 'delicate', 'happy': 'ebullient', 'sad': 'wistful'
    }
  },

  translationLexicon: {
    hi: {
      'hello': 'नमस्ते', 'welcome': 'स्वागत है', 'transform': 'रूपांतरित करें', 'content': 'सामग्री',
      'summary': 'सारांश', 'report': 'रिपोर्ट', 'quality': 'गुणवत्ता', 'score': 'स्कोर',
      'language': 'भाषा', 'platform': 'मंच', 'automated': 'स्वचालित', 'artificial intelligence': 'कृत्रिम बुद्धिमत्ता',
      'machine learning': 'मशीन लर्निंग', 'future': 'भविष्य', 'data': 'डेटा', 'user': 'उपयोगकर्ता',
      'system': 'प्रणाली', 'workflow': 'कार्यप्रवाह', 'fast': 'तेज़', 'reliable': 'विश्वसनीय',
      'professional': 'पेशेवर', 'good': 'अच्छा', 'important': 'महत्वपूर्ण', 'analysis': 'विश्लेषण',
      'technology': 'तकनीक', 'project': 'परियोजना', 'process': 'प्रक्रिया', 'result': 'परिणाम',
      'is': 'है', 'are': 'हैं', 'and': 'और', 'or': 'या', 'in': 'में', 'for': 'के लिए'
    },
    mr: {
      'hello': 'नमस्कार', 'welcome': 'स्वागत आहे', 'transform': 'रूपांतर करा', 'content': 'सामग्री',
      'summary': 'सारांश', 'report': 'अहवाल', 'quality': 'गुणवत्ता', 'score': 'गुण',
      'language': 'भाषा', 'platform': 'प्लॅटफॉर्म', 'automated': 'स्वयंचलित', 'artificial intelligence': 'कृत्रिम बुद्धिमत्ता',
      'technology': 'तंत्रज्ञान', 'data': 'माहिती', 'user': 'वापरकर्ता', 'system': 'प्रणाली',
      'fast': 'जलद', 'reliable': 'विश्वासार्ह', 'important': 'महत्त्वाचे', 'result': 'निकाल',
      'is': 'आहे', 'are': 'आहेत', 'and': 'आणि', 'in': 'मध्ये', 'for': 'साठी'
    },
    es: {
      'hello': 'hola', 'welcome': 'bienvenido', 'transform': 'transformar', 'content': 'contenido',
      'summary': 'resumen', 'report': 'informe', 'quality': 'calidad', 'score': 'puntuación',
      'language': 'idioma', 'platform': 'plataforma', 'automated': 'automatizado', 'artificial intelligence': 'inteligencia artificial',
      'future': 'futuro', 'data': 'datos', 'user': 'usuario', 'system': 'sistema', 'technology': 'tecnología',
      'fast': 'rápido', 'reliable': 'confiable', 'good': 'bueno', 'important': 'importante',
      'is': 'es', 'are': 'son', 'and': 'y', 'in': 'en', 'for': 'para'
    },
    fr: {
      'hello': 'bonjour', 'welcome': 'bienvenue', 'transform': 'transformer', 'content': 'contenu',
      'summary': 'résumé', 'report': 'rapport', 'quality': 'qualité', 'score': 'score',
      'language': 'langue', 'platform': 'plateforme', 'automated': 'automatisé', 'artificial intelligence': 'intelligence artificielle',
      'future': 'avenir', 'data': 'données', 'user': 'utilisateur', 'system': 'système', 'technology': 'technologie',
      'fast': 'rapide', 'reliable': 'fiable', 'important': 'important', 'is': 'est', 'are': 'sont',
      'and': 'et', 'in': 'dans', 'for': 'pour'
    },
    de: {
      'hello': 'hallo', 'welcome': 'willkommen', 'transform': 'transformieren', 'content': 'inhalt',
      'summary': 'zusammenfassung', 'report': 'bericht', 'quality': 'qualität', 'score': 'bewertung',
      'language': 'sprache', 'platform': 'plattform', 'automated': 'automatisiert', 'artificial intelligence': 'künstliche intelligenz',
      'future': 'zukunft', 'data': 'daten', 'user': 'benutzer', 'system': 'system', 'technology': 'technologie',
      'fast': 'schnell', 'reliable': 'zuverlässig', 'important': 'wichtig', 'is': 'ist', 'are': 'sind',
      'and': 'und', 'in': 'in', 'for': 'für'
    },
    ja: {
      'hello': 'こんにちは', 'welcome': 'ようこそ', 'transform': '変換する', 'content': 'コンテンツ',
      'summary': '要約', 'report': 'レポート', 'quality': '品質', 'score': 'スコア',
      'language': '言語', 'platform': 'プラットフォーム', 'automated': '自動化された', 'artificial intelligence': '人工知能',
      'future': '未来', 'data': 'データ', 'user': 'ユーザー', 'system': 'システム', 'technology': '技術',
      'fast': '高速', 'reliable': '信頼できる', 'important': '重要', 'good': '良い',
      'is': 'です', 'are': 'です', 'and': 'そして', 'in': 'で', 'for': 'のために'
    }
  },

  splitSentences(text) {
    if (!text) return [];
    return text
      .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|~|')
      .split('|~|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  },

  getWords(text) {
    return (text || '').match(/\b[\w'\-]+\b/g) || [];
  },

  countSyllables(word) {
    word = word.toLowerCase().replace(/(?:[^laeiouy]|ed|es|e)$/, '');
    word = word.replace(/^y/, '');
    const m = word.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  },

  summarize(text, opts = {}) {
    const length = opts.length || 'medium';
    const sentences = this.splitSentences(text);
    if (sentences.length <= 1) return text;

    const words = this.getWords(text.toLowerCase());
    const stopWords = new Set(['the','is','at','which','on','and','a','an','in','to','of','for','it','as','with','that','this','by','from','are','was','were','be','been','or']);
    const freq = {};
    words.forEach(w => {
      if (!stopWords.has(w) && w.length > 2) freq[w] = (freq[w] || 0) + 1;
    });

    const scored = sentences.map((s, idx) => {
      const sWords = this.getWords(s.toLowerCase());
      let score = 0;
      sWords.forEach(w => { score += (freq[w] || 0); });
      score = score / Math.max(sWords.length, 1);
      if (idx === 0) score *= 1.5;
      if (idx === 1) score *= 1.2;
      if (/\d+/.test(s)) score *= 1.25;
      if (/[A-Z][a-z]+/.test(s)) score *= 1.15;
      return { sentence: s, index: idx, score };
    });

    let targetCount = 2;
    if (length === 'short') targetCount = Math.max(1, Math.min(2, Math.ceil(sentences.length * 0.25)));
    else if (length === 'medium') targetCount = Math.max(2, Math.min(4, Math.ceil(sentences.length * 0.45)));
    else targetCount = Math.max(3, Math.min(7, Math.ceil(sentences.length * 0.65)));

    const selected = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, targetCount)
      .sort((a, b) => a.index - b.index)
      .map(item => item.sentence);

    if (length === 'short') {
      return `**Core Executive Takeaway:**\n${selected[0] || ''}\n\n**Key Highlights:**\n` +
        selected.map(s => `• ${s}`).join('\n');
    } else if (length === 'medium') {
      return `### Executive Summary\n\n${selected.join(' ')}\n\n### Key Conclusions & Facts\n` +
        selected.map(s => `• ${s}`).join('\n');
    } else {
      return `### Comprehensive Executive Briefing\n\n**Overview:**\n${selected.slice(0, 2).join(' ')}\n\n**Detailed Findings:**\n` +
        selected.slice(2).map((s, i) => `**Point ${i+1}:** ${s}`).join('\n\n') +
        `\n\n**Strategic Conclusion:**\n${selected[selected.length - 1]}`;
    }
  },

  tone(text, opts = {}) {
    const targetTone = opts.targetTone || 'professional';
    const dict = this.toneLexicon[targetTone] || this.toneLexicon.professional;
    let transformed = text;

    Object.keys(dict).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      transformed = transformed.replace(regex, (match) => {
        const replacement = dict[key];
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    });

    if (targetTone === 'academic') {
      transformed = transformed.replace(/I think|in my opinion/gi, 'Evidence suggests');
      transformed = transformed.replace(/really /gi, 'substantially ');
    } else if (targetTone === 'persuasive') {
      if (!transformed.includes('!')) {
        transformed = transformed.trim() + ' Implementing this strategy will deliver measurable results.';
      }
    } else if (targetTone === 'casual') {
      transformed = transformed.replace(/Dear Sir or Madam|To Whom It May Concern/gi, 'Hey everyone');
    }

    return transformed;
  },

  translate(text, opts = {}) {
    let target = opts.targetLang || 'hi';
    const source = opts.sourceLang || 'auto';

    let detectedSource = 'en';
    if (source === 'auto') {
      if (/[\u0900-\u097F]/.test(text)) detectedSource = 'hi';
      else if (/[\u3040-\u30FF\u4E00-\u9FAF]/.test(text)) detectedSource = 'ja';
      else if (/[¿¡áéíóúñ]/i.test(text)) detectedSource = 'es';
      else if (/[àâçéèêëîïôû]/i.test(text)) detectedSource = 'fr';
      else if (/[äöüß]/i.test(text)) detectedSource = 'de';
    }

    const dict = this.translationLexicon[target] || this.translationLexicon.hi;
    let words = text.split(/(\s+|[.,!?:;"'()]+)/);
    let translated = words.map(w => {
      const lower = w.toLowerCase();
      if (dict[lower]) {
        return dict[lower];
      }
      return w;
    }).join('');

    const langNames = { hi: 'Hindi (हिंदी)', mr: 'Marathi (मराठी)', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', en: 'English' };
    return `[Translated into ${langNames[target] || target}]:\n${translated}`;
  },

  convert(text, opts = {}) {
    const format = opts.targetFormat || 'bullets';
    const sentences = this.splitSentences(text);
    const title = sentences[0] ? sentences[0].slice(0, 50).replace(/[.,!?]+$/, '') : 'Transformed Content';

    switch (format) {
      case 'paragraph':
        return sentences.join(' ');

      case 'bullets':
        return sentences.map(s => `• ${s.trim()}`).join('\n');

      case 'numbered':
        return sentences.map((s, idx) => `${idx + 1}. ${s.trim()}`).join('\n');

      case 'markdown':
        return `# ${title}\n\n## Executive Summary\n${sentences.slice(0, 2).join(' ')}\n\n## Key Points\n${sentences.map(s => `* **${s.slice(0, 30)}...** ${s}`).join('\n')}\n\n> *Generated automatically via TransformAI format engine.*`;

      case 'json': {
        const jsonObj = {
          title,
          summary: sentences.slice(0, 2).join(' '),
          keyPoints: sentences,
          metadata: {
            wordCount: this.getWords(text).length,
            sentenceCount: sentences.length,
            generatedAt: new Date().toISOString(),
            schemaVersion: '1.0.0'
          }
        };
        return JSON.stringify(jsonObj, null, 2);
      }

      case 'email':
        return `Subject: Overview: ${title}\n\nDear Colleague,\n\nI wanted to share a synthesized summary regarding our current progress:\n\n${sentences.slice(0, 2).join(' ')}\n\nKey updates to note:\n${sentences.map(s => ` - ${s}`).join('\n')}\n\nPlease let me know if you have any questions or require additional details.\n\nBest regards,\nTransformAI Content Specialist`;

      case 'report':
        return `=======================================================\n             FORMAL EXECUTIVE REPORT\n=======================================================\nTITLE: ${title.toUpperCase()}\nDATE: ${new Date().toLocaleDateString()}\nSTATUS: Approved for Distribution\n\n1. EXECUTIVE SUMMARY\n--------------------\n${sentences.slice(0, 2).join(' ')}\n\n2. DETAILED ANALYSIS & FINDINGS\n-------------------------------\n${sentences.map((s, idx) => `[Sec 2.${idx + 1}] ${s}`).join('\n')}\n\n3. STRATEGIC RECOMMENDATIONS\n-----------------------------\n• Maintain rigorous alignment across stakeholders.\n• Monitor key deliverables and implementation milestones.\n=======================================================`;

      default:
        return text;
    }
  },

  createWordDiff(origText, corrText) {
    if (!origText && !corrText) return '';
    if (!origText) return `<ins class="diff-ins">${escapeHtml(corrText)}</ins>`;
    if (!corrText) return `<del class="diff-del">${escapeHtml(origText)}</del>`;

    const origTokens = (origText || '').match(/\S+|\s+/g) || [];
    const corrTokens = (corrText || '').match(/\S+|\s+/g) || [];

    const n = origTokens.length;
    const m = corrTokens.length;

    // LCS dynamic programming table
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (origTokens[i] === corrTokens[j]) {
          dp[i + 1][j + 1] = dp[i][j] + 1;
        } else {
          dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    // Backtrack to find aligned token operations
    let i = n;
    let j = m;
    const ops = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origTokens[i - 1] === corrTokens[j - 1]) {
        ops.push({ op: 'eq', val: origTokens[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        ops.push({ op: 'ins', val: corrTokens[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        ops.push({ op: 'del', val: origTokens[i - 1] });
        i--;
      } else {
        break;
      }
    }
    ops.reverse();

    let html = '';
    for (const { op, val } of ops) {
      const esc = escapeHtml(val);
      if (op === 'eq') {
        html += esc;
      } else if (op === 'del') {
        html += val.trim() ? `<del class="diff-del">${esc}</del>` : esc;
      } else if (op === 'ins') {
        html += val.trim() ? `<ins class="diff-ins">${esc}</ins>` : esc;
      }
    }
    return html;
  },

  inflectThirdPerson(verb) {
    verb = (verb || '').toLowerCase();
    const irregular = { have: 'has', be: 'is', do: 'does', go: 'goes' };
    if (irregular[verb]) return irregular[verb];
    if (/(?:s|sh|ch|x|z|o)$/.test(verb)) return verb + 'es';
    if (/[^aeiou]y$/.test(verb)) return verb.slice(0, -1) + 'ies';
    return verb + 's';
  },

  grammar(text, opts = {}) {
    if (!text || !text.trim()) {
      return { correctedText: '', diffHtml: '' };
    }

    let corrected = text.trim();

    // Pass 1: Spacing around punctuation
    corrected = corrected.replace(/\s+([.,!?;:])/g, '$1');
    corrected = corrected.replace(/([.,!?;:])(?=[A-Za-z0-9])/g, '$1 ');

    // Pass 2: Salutations & Greeting openers
    corrected = corrected.replace(
      /\b(hello|hi|hey)\s+(how|what|who|where|why|when|are|is|can|could|would|should|do|does|did)\b/gi,
      '$1, $2'
    );

    // Pass 3: Demonstrative agreement
    corrected = corrected.replace(/\b(this)\s+(are|were)\b/gi, 'these $2');
    corrected = corrected.replace(/\b(that)\s+(are|were)\b/gi, 'those $2');
    corrected = corrected.replace(/\b(these)\s+(is|was)\b/gi, 'these are');
    corrected = corrected.replace(/\b(those)\s+(is|was)\b/gi, 'those are');

    // Pass 4: Subject-Verb Agreement (Be, Have, Do)
    corrected = corrected.replace(/\b(he|she|it)\s+(am|are)\b/gi, '$1 is');
    corrected = corrected.replace(/\b(he|she|it)\s+were\b/gi, '$1 was');
    corrected = corrected.replace(/\b(he|she|it)\s+have\b/gi, '$1 has');
    corrected = corrected.replace(/\b(he|she|it)\s+do\b/gi, '$1 does');

    corrected = corrected.replace(/\b(they|we|you)\s+(is|am)\b/gi, '$1 are');
    corrected = corrected.replace(/\b(they|we|you)\s+was\b/gi, '$1 were');
    corrected = corrected.replace(/\b(they|we|you)\s+has\b/gi, '$1 have');
    corrected = corrected.replace(/\b(they|we|you)\s+does\b/gi, '$1 do');

    corrected = corrected.replace(/\b(i)\s+(is|are)\b/gi, '$1 am');
    corrected = corrected.replace(/\b(i)\s+has\b/gi, '$1 have');

    // Pass 5: 3rd person singular present inflection for common verbs
    const commonVerbs = new Set([
      'go', 'do', 'come', 'see', 'say', 'make', 'take', 'know', 'think', 'look',
      'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try',
      'leave', 'call', 'play', 'run', 'walk', 'write', 'read', 'speak', 'eat',
      'sing', 'drive', 'like', 'need', 'help', 'live', 'start', 'love', 'listen',
      'watch', 'study', 'talk', 'stay', 'stand', 'sit', 'open', 'close', 'send'
    ]);

    corrected = corrected.replace(/\b(he|she|it)\s+([a-zA-Z]+)\b/gi, (match, subj, verb) => {
      const lowerVerb = verb.toLowerCase();
      if (commonVerbs.has(lowerVerb)) {
        const inflected = this.inflectThirdPerson(lowerVerb);
        return `${subj} ${inflected}`;
      }
      return match;
    });

    // Pass 6: Missing count noun article after copula verbs (is|am|are|was|were)
    const countNouns = new Set([
      'girl', 'boy', 'child', 'man', 'woman', 'student', 'teacher', 'doctor', 'nurse',
      'engineer', 'developer', 'book', 'car', 'pen', 'phone', 'computer', 'dog', 'cat',
      'house', 'school', 'college', 'apple', 'orange', 'table', 'chair', 'problem',
      'question', 'game', 'player', 'room', 'friend', 'family', 'song', 'movie'
    ]);

    corrected = corrected.replace(/\b(is|am|are|was|were)\s+([a-zA-Z]+)\b/gi, (match, copula, noun) => {
      const lowerNoun = noun.toLowerCase();
      if (countNouns.has(lowerNoun)) {
        const article = /^[aeiou]/i.test(lowerNoun) ? 'an' : 'a';
        return `${copula} ${article} ${noun}`;
      }
      return match;
    });

    // Pass 7: Pronoun "I" and Capitalization
    corrected = corrected.replace(/\b(i)\b/g, 'I');
    corrected = corrected.replace(/(^|[.?!]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

    // Pass 8: Spelling dictionary
    Object.keys(this.spellingDict).forEach(typo => {
      const regex = new RegExp(`\\b${typo}\\b`, 'gi');
      corrected = corrected.replace(regex, (m) => {
        const fix = this.spellingDict[typo];
        if (m[0] === m[0].toUpperCase()) {
          return fix.charAt(0).toUpperCase() + fix.slice(1);
        }
        return fix;
      });
    });

    // Pass 9: Terminal Punctuation & Question Detection
    let trimmed = corrected.trim();
    if (trimmed.length > 0) {
      if (!/[.?!]$/.test(trimmed)) {
        if (/^(?:hello,\s+|hi,\s+|hey,\s+)?(?:how|what|why|who|where|when|which|can|could|would|should|will|is|are|am|do|does|did)\b/i.test(trimmed)) {
          trimmed += '?';
        } else {
          trimmed += '.';
        }
      }
      corrected = trimmed;
    }

    // Pass 10: Accurate Word-level Visual Diff
    const diffHtml = this.createWordDiff(text, corrected);

    return {
      correctedText: corrected,
      diffHtml
    };
  },

  expand(text, opts = {}) {
    const level = opts.expansionLevel || '2x';
    const sentences = this.splitSentences(text);

    const expansions = sentences.map(s => {
      const clean = s.replace(/[.!?]+$/, '');
      if (level === '1.5x') {
        return `${s} In practical terms, this concept establishes a critical operational baseline that directly influences subsequent outcomes and workflows.`;
      } else if (level === '2x') {
        return `${s} Specifically, thorough analysis reveals that this dynamic plays a foundational role in modern workflows. Furthermore, by addressing the underlying mechanisms and providing structured visibility, organizations can accelerate throughput and achieve reliable long-term consistency.`;
      } else {
        return `### Focus Area: ${clean.slice(0, 40)}\n\n${s}\n\n**Contextual Background:** Examining this point in depth demonstrates how interrelated architectural factors govern modern performance. Without deliberate planning, bottlenecks frequently emerge in real-world scenarios.\n\n**Practical Implications:** Implementing robust automated practices around this area reduces friction, mitigates recurring risks, and empowers teams to scale sustainably.\n\n**Measurable Outcome:** Clear adherence to this standard ensures verifiable quality benchmarks and transparent stakeholder alignment.`;
      }
    });

    return expansions.join('\n\n');
  },

  simplify(text, opts = {}) {
    const level = opts.readingLevel || 'plain-english';
    let simplified = text;

    Object.keys(this.simplificationMap).forEach(hardWord => {
      const regex = new RegExp(`\\b${hardWord}\\b`, 'gi');
      simplified = simplified.replace(regex, (m) => {
        const easy = this.simplificationMap[hardWord];
        if (m[0] === m[0].toUpperCase()) return easy.charAt(0).toUpperCase() + easy.slice(1);
        return easy;
      });
    });

    const sentences = this.splitSentences(simplified);
    const splitSentences = sentences.map(s => {
      const words = s.split(' ');
      if (words.length > 22 && s.includes(' and ')) {
        const andIdx = s.indexOf(' and ');
        return s.slice(0, andIdx).trim() + '. ' + s.slice(andIdx + 5).charAt(0).toUpperCase() + s.slice(andIdx + 6).trim();
      }
      return s;
    });

    simplified = splitSentences.join(' ');

    if (level === 'elementary') {
      simplified = `Here is the simple version:\n\n` + simplified
        .replace(/complex|intricate/gi, 'hard')
        .replace(/significant/gi, 'big')
        .replace(/objective/gi, 'goal');
    }

    return simplified;
  },

  scoreQuality(text, opts = {}) {
    const words = this.getWords(text);
    const sentences = this.splitSentences(text);
    const wordCount = words.length;
    const sentenceCount = Math.max(sentences.length, 1);

    if (wordCount < 5) {
      return {
        overall: 30,
        breakdown: {
          grammar: 40, clarity: 30, readability: 30,
          coherence: 25, structure: 25, relevance: 30
        },
        fleschScore: 20,
        explanation: 'The provided text is too brief to conduct an exhaustive multi-dimensional quality analysis.',
        suggestions: [
          'Provide at least 2-3 complete sentences for comprehensive evaluation.',
          'Include explicit context, key assertions, and supporting evidence.'
        ],
        isHeuristic: true
      };
    }

    let totalSyllables = 0;
    words.forEach(w => { totalSyllables += this.countSyllables(w); });
    const asl = wordCount / sentenceCount;
    const asw = totalSyllables / wordCount;
    const rawFlesch = 206.835 - (1.015 * asl) - (84.6 * asw);
    const fleschScore = Math.max(10, Math.min(100, Math.round(rawFlesch)));

    let grammarPenalties = 0;
    words.forEach(w => {
      if (this.spellingDict[w.toLowerCase()]) grammarPenalties += 8;
    });
    if (!/[.!?]$/.test(text.trim())) grammarPenalties += 5;
    const grammarScore = Math.max(20, 100 - grammarPenalties);

    let clarityScore = 85;
    if (asl > 25) clarityScore -= 20;
    else if (asl > 18) clarityScore -= 10;
    if (/in order to|due to the fact that|at this point in time/i.test(text)) clarityScore -= 10;
    clarityScore = Math.max(20, clarityScore);

    let structureScore = 70;
    if (text.includes('\n\n') || text.includes('\n')) structureScore += 15;
    if (/^[A-Z]/.test(text.trim())) structureScore += 10;
    if (sentences.length >= 3) structureScore += 5;
    structureScore = Math.min(100, structureScore);

    let coherenceScore = 75;
    const transitional = /however|furthermore|therefore|additionally|specifically|subsequently|moreover|consequently/i;
    if (transitional.test(text)) coherenceScore += 15;
    if (sentenceCount > 1) coherenceScore += 5;
    coherenceScore = Math.min(100, coherenceScore);

    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const lexicalDiversity = uniqueWords.size / wordCount;
    let vocabScore = Math.round(lexicalDiversity * 100);
    vocabScore = Math.max(40, Math.min(95, vocabScore + 10));

    const overall = Math.round(
      (grammarScore * 0.25) +
      (clarityScore * 0.20) +
      (fleschScore * 0.15) +
      (coherenceScore * 0.15) +
      (structureScore * 0.15) +
      (vocabScore * 0.10)
    );

    const suggestions = [];
    if (grammarPenalties > 0) suggestions.push('Correct identified spelling and punctuation anomalies.');
    if (asl > 22) suggestions.push('Split longer sentences (averaging >22 words) into concise statements to boost clarity.');
    if (!transitional.test(text)) suggestions.push('Introduce transition words (e.g. "Furthermore", "Consequently") to strengthen logical flow.');
    if (structureScore < 85) suggestions.push('Use structured paragraph breaks or bulleted lists to enhance visual scannability.');
    if (suggestions.length === 0) suggestions.push('Content demonstrates high structural integrity and polished readability across all metrics.');

    let explanation = `Scored **${overall}/100** based on analytical heuristics. `;
    if (overall >= 85) explanation += 'The content exhibits excellent grammatical correctness, strong sentence structure, and fluid coherence.';
    else if (overall >= 70) explanation += 'The content is solidly written with good clarity, though minor refinements in sentence length or flow would elevate it further.';
    else explanation += 'The text has noticeable opportunities for improvement in sentence pacing, structural organization, and mechanics.';

    return {
      overall,
      breakdown: {
        grammar: grammarScore,
        clarity: clarityScore,
        readability: fleschScore,
        coherence: coherenceScore,
        structure: structureScore,
        relevance: vocabScore
      },
      fleschScore,
      explanation,
      suggestions,
      isHeuristic: true
    };
  },
// --- 8. AI Quiz & Practice Question Generator Engine ---
  generateQuiz(text, opts = {}) {
    if (!text || text.trim().length < 30) {
      throw new Error('Input content is too short. Please provide at least 30 characters of text to generate questions.');
    }

    const requestedCount = Math.min(50, Math.max(1, parseInt(opts.count) || 5));
    const difficulty = opts.difficulty || 'medium'; // 'easy' | 'medium' | 'hard'
    let allowedTypes = Array.isArray(opts.types) && opts.types.length > 0 
      ? opts.types 
      : ['mcq', 'true_false', 'blanks', 'short'];

    // Clean and split sentences, including semicolons and distinct clauses
    const rawSentences = text
      .split(/(?<=[.?!])\s+|\n+|;\s+/)
      .map(s => s.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter(s => s.length >= 20 && s.includes(' '));

    if (rawSentences.length === 0) {
      throw new Error('Could not identify sufficient complete sentences from the provided content.');
    }

    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'to', 'with', 'by',
      'that', 'this', 'these', 'those', 'from', 'it', 'its', 'they', 'their', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'if', 'then', 'else', 'when', 'where',
      'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
      'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should'
    ]);

    const facts = [];
    const keywords = [];

    rawSentences.forEach((s, idx) => {
      const words = s.split(/[^a-zA-Z0-9_-]+/).filter(w => w.length > 3 && !stopwords.has(w.toLowerCase()));
      words.forEach(w => keywords.push(w));

      const isDef = /(?:is a|is an|are|refers to|defined as|consists of|used for|means|causes|involves|helps|functions as)/i.test(s);
      const isContrast = /(?:unlike|in contrast|whereas|however|while|differs|opposite)/i.test(s);
      const hasNumber = /\b\d+(?:\.\d+)?%?\b/.test(s);

      facts.push({
        sentence: s,
        index: idx,
        isDef,
        isContrast,
        hasNumber,
        words,
        score: (isDef ? 3 : 1) + (isContrast ? 2 : 0) + (hasNumber ? 2 : 0) + Math.min(words.length, 5)
      });
    });

    facts.sort((a, b) => b.score - a.score);

    // Check capacity for distinct meaningful questions
    const maxCapacity = facts.length * allowedTypes.length;
    if (requestedCount > maxCapacity) {
      throw new Error(`The provided content can only support up to ${maxCapacity} distinct, meaningful question${maxCapacity > 1 ? 's' : ''}. Please choose ${maxCapacity} or fewer questions, or provide more study material.`);
    }

    // Compute Title from most salient concepts
    let title = 'Practice Quiz';
    if (facts.length > 0) {
      const topWords = {};
      keywords.forEach(w => {
        const k = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        topWords[k] = (topWords[k] || 0) + 1;
      });
      const sortedW = Object.keys(topWords).sort((a, b) => topWords[b] - topWords[a]);
      if (sortedW.length >= 2) {
        title = `${sortedW[0]} & ${sortedW[1]} Practice Set`;
      } else if (sortedW.length === 1) {
        title = `${sortedW[0]} Comprehensive Quiz`;
      }
    }

    const questions = [];
    let qIdCounter = 1;

    const distractorPool = [];
    facts.forEach(f => {
      if (f.words.length >= 2) {
        distractorPool.push(f.words.slice(0, 3).join(' '));
      }
      const parts = f.sentence.split(/,|;|\band\b/i).map(p => p.trim()).filter(p => p.length > 15 && p.length < 90);
      parts.forEach(p => distractorPool.push(p));
    });

    // Round-robin generation across facts and question types
    let factCursor = 0;
    let attempts = 0;
    const maxAttempts = facts.length * allowedTypes.length * 4;

    while (questions.length < requestedCount && attempts < maxAttempts) {
      attempts++;
      const fact = facts[factCursor % facts.length];
      const targetType = allowedTypes[questions.length % allowedTypes.length];
      factCursor++;

      if (questions.some(q => q.sourceIndex === fact.index && q.type === targetType)) {
        continue;
      }

      let qObj = null;
      if (targetType === 'mcq') {
        qObj = this._generateMCQQuestion(fact, facts, distractorPool, qIdCounter, difficulty);
      } else if (targetType === 'true_false') {
        qObj = this._generateTFQuestion(fact, qIdCounter, difficulty);
      } else if (targetType === 'blanks') {
        qObj = this._generateBlanksQuestion(fact, qIdCounter, difficulty);
      } else if (targetType === 'short') {
        qObj = this._generateShortQuestion(fact, qIdCounter, difficulty);
      }

      if (qObj) {
        qIdCounter++;
        questions.push(qObj);
      }
    }

    // Second pass to ensure exact requested count is reached if some specific types failed on first pass
    if (questions.length < requestedCount) {
      for (let fi = 0; fi < facts.length && questions.length < requestedCount; fi++) {
        const fact = facts[fi];
        for (const type of allowedTypes) {
          if (questions.length >= requestedCount) break;
          if (questions.some(q => q.sourceIndex === fact.index && q.type === type)) continue;

          let qObj = null;
          if (type === 'mcq') {
            qObj = this._generateMCQQuestion(fact, facts, distractorPool, qIdCounter, difficulty);
          } else if (type === 'true_false') {
            qObj = this._generateTFQuestion(fact, qIdCounter, difficulty);
          } else if (type === 'blanks') {
            qObj = this._generateBlanksQuestion(fact, qIdCounter, difficulty);
          } else if (type === 'short') {
            qObj = this._generateShortQuestion(fact, qIdCounter, difficulty);
          }

          if (qObj) {
            qIdCounter++;
            questions.push(qObj);
          }
        }
      }
    }

    // If source content genuinely cannot support the requested count, notify the user clearly
    if (questions.length < requestedCount) {
      const supported = questions.length;
      throw new Error(`The provided content can only support ${supported} distinct, meaningful question${supported > 1 ? 's' : ''}. Please choose ${supported} or fewer questions, or provide more study material.`);
    }

    const finalQuestions = questions.slice(0, requestedCount);
    finalQuestions.forEach((q, idx) => {
      q.id = `q_${idx + 1}`;
    });

    return {
      title,
      difficulty,
      questionCount: finalQuestions.length,
      questionTypes: allowedTypes,
      sourcePreview: text.trim().slice(0, 180) + (text.length > 180 ? '...' : ''),
      sourceText: text,
      createdAt: Date.now(),
      engine: 'local-nlp-v1',
      questions: finalQuestions
    };
  },

  _generateMCQQuestion(fact, allFacts, distractorPool, id, difficulty) {
    const s = fact.sentence;
    let questionText = '';
    let correctAnswer = '';
    let distractors = [];

    const isMatch = s.match(/^([^,]+?)\s+(?:is an?|are|refers to|was|were)\s+(.+)$/i);
    if (isMatch && isMatch[1].length < 45) {
      const subject = isMatch[1].trim();
      const predicate = isMatch[2].trim().replace(/\.$/, '');
      questionText = `According to the text, what is ${subject}?`;
      correctAnswer = predicate.charAt(0).toUpperCase() + predicate.slice(1);

      distractors = allFacts
        .filter(f => f.sentence !== s)
        .map(f => {
          const m = f.sentence.match(/^([^,]+?)\s+(?:is an?|are|refers to|was|were)\s+(.+)$/i);
          if (m && m[2]) return m[2].trim().replace(/\.$/, '');
          return f.sentence.slice(0, 70).replace(/\.$/, '');
        })
        .filter(d => d && d.toLowerCase() !== correctAnswer.toLowerCase())
        .slice(0, 3);
    } else {
      const keyWord = fact.words[0] || 'the subject';
      questionText = `Based on the provided material, which statement accurately reflects ${keyWord}?`;
      correctAnswer = s.replace(/\.$/, '');

      distractors = allFacts
        .filter(f => f.sentence !== s)
        .map(f => f.sentence.replace(/\.$/, ''))
        .filter(d => d.toLowerCase() !== correctAnswer.toLowerCase())
        .slice(0, 3);
    }

    while (distractors.length < 3) {
      distractors.push(`It operates completely independent of ${distractorPool[distractors.length] || 'general constraints'}`);
    }

    const options = [correctAnswer, ...distractors.slice(0, 3)];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const answerIndex = options.indexOf(correctAnswer);

    return {
      id: `q_${id}`,
      type: 'mcq',
      question: questionText,
      options,
      answer: correctAnswer,
      answerIndex,
      explanation: `Directly supported by the source text: "${s}"`,
      sourceIndex: fact.index,
      sourceSentence: s
    };
  },

  _generateTFQuestion(fact, id, difficulty) {
    const s = fact.sentence;
    const isTrue = id % 2 === 1;

    let questionText = s;
    let explanation = `The text explicitly states: "${s}"`;

    if (!isTrue) {
      if (/\bwithout\b/i.test(s)) {
        questionText = s.replace(/\bwithout\b/i, 'with required');
      } else if (/\bcan\b/i.test(s)) {
        questionText = s.replace(/\bcan\b/i, 'cannot');
      } else if (/\bis\b/i.test(s)) {
        questionText = s.replace(/\bis\b/i, 'is never');
      } else if (/\bare\b/i.test(s)) {
        questionText = s.replace(/\bare\b/i, 'are not');
      } else {
        questionText = `The provided text states that ${s.charAt(0).toLowerCase() + s.slice(1)} does not apply.`;
      }
      explanation = `False. The original material actually confirms: "${s}"`;
    }

    return {
      id: `q_${id}`,
      type: 'true_false',
      question: questionText,
      options: ['True', 'False'],
      answer: isTrue ? 'True' : 'False',
      answerIndex: isTrue ? 0 : 1,
      explanation,
      sourceIndex: fact.index,
      sourceSentence: s
    };
  },

  _generateBlanksQuestion(fact, id, difficulty) {
    const s = fact.sentence;
    const targetWord = fact.words.slice().sort((a, b) => b.length - a.length)[0] || 'concept';
    const regex = new RegExp(`\\b${targetWord}\\b`, 'i');

    if (!regex.test(s)) {
      return null;
    }

    const questionText = s.replace(regex, '________');

    return {
      id: `q_${id}`,
      type: 'blanks',
      question: `Fill in the blank: "${questionText}"`,
      answer: targetWord,
      explanation: `The missing term is "${targetWord}". Full sentence from text: "${s}"`,
      sourceIndex: fact.index,
      sourceSentence: s
    };
  },

  _generateShortQuestion(fact, id, difficulty) {
    const s = fact.sentence;
    const key = fact.words[0] || 'the core subject';
    let questionText = `According to the source content, explain the significance of ${key}.`;
    
    const isDef = s.match(/^([^,]+?)\s+(?:is an?|are|refers to|means)/i);
    if (isDef && isDef[1]) {
      questionText = `What is ${isDef[1].trim()} based on the provided text?`;
    }

    return {
      id: `q_${id}`,
      type: 'short',
      question: questionText,
      answer: s,
      explanation: `Key points from the text: "${s}"`,
      sourceIndex: fact.index,
      sourceSentence: s
    };
  }
};

const TRANSFORMATIONS = {
  summarize: {
    id: 'summarize',
    label: 'Executive Summarize',
    icon: 'ri-file-reduce-line',
    color: 'purple',
    desc: 'Generate concise, fact-preserving summaries with configurable length',
    buildPrompt(input, opts = {}) {
      const length = opts.length || 'medium';
      const instructions = {
        short: 'Produce a high-impact, 1-2 sentence core takeaway followed by 3 essential bullet points.',
        medium: 'Produce a comprehensive executive summary (2-3 structured paragraphs) retaining all critical names, dates, metrics, and conclusions.',
        detailed: 'Produce an in-depth executive briefing with an Overview, Key Findings, and Strategic Conclusions.'
      };
      return `Perform an Executive Summarization on the following text.\nRequirement: ${instructions[length]}\nCrucial: Preserve all key facts, numbers, dates, and conclusions faithfully. Do not fabricate facts.\n\nContent:\n${input}`;
    },
    extraOptions: [
      { id: 'length', label: 'Summary Length', type: 'select', choices: [
        { value: 'short', label: 'Short (Quick Takeaways)' },
        { value: 'medium', label: 'Medium (Executive Overview)' },
        { value: 'detailed', label: 'Detailed (Comprehensive Briefing)' }
      ], default: 'medium' }
    ]
  },

  tone: {
    id: 'tone',
    label: 'Tone Transformation',
    icon: 'ri-chat-voice-line',
    color: 'cyan',
    desc: 'Adapt writing style across Professional, Formal, Casual, Academic, Creative',
    buildPrompt(input, opts = {}) {
      const tone = opts.targetTone || 'professional';
      const descriptions = {
        professional: 'clear, confident, outcome-oriented business English with polite assertiveness',
        formal: 'highly structured, grammatically traditional English with zero contractions or slang',
        casual: 'conversational, approachable, friendly, and natural everyday language',
        friendly: 'warm, welcoming, supportive, and emotionally positive tone',
        persuasive: 'compelling, value-driven, motivational copy focused on benefits and action',
        academic: 'rigorous scholarly tone with precise terminology and objective stance',
        creative: 'evocative, vivid, imaginative prose with expressive sensory imagery'
      };
      return `Rewrite the following content in a ${tone.toUpperCase()} tone (${descriptions[tone] || descriptions.professional}).\nCrucial: Retain the complete original meaning, facts, and intent while adapting syntax and diction.\n\nContent:\n${input}`;
    },
    extraOptions: [
      { id: 'targetTone', label: 'Target Tone', type: 'select', choices: [
        { value: 'professional', label: 'Professional' },
        { value: 'formal', label: 'Formal' },
        { value: 'casual', label: 'Casual' },
        { value: 'friendly', label: 'Friendly' },
        { value: 'persuasive', label: 'Persuasive' },
        { value: 'academic', label: 'Academic' },
        { value: 'creative', label: 'Creative' }
      ], default: 'professional' }
    ]
  },

  translate: {
    id: 'translate',
    label: 'Language Translation',
    icon: 'ri-global-line',
    color: 'green',
    desc: 'Accurate translation across English, Hindi, Marathi, Spanish, French, German, Japanese',
    buildPrompt(input, opts = {}) {
      const source = opts.sourceLang === 'auto' ? 'automatically detected language' : (opts.sourceLang || 'English');
      const targetMap = {
        hi: 'Hindi (हिंदी)',
        mr: 'Marathi (मराठी)',
        en: 'English',
        es: 'Spanish (Español)',
        fr: 'French (Français)',
        de: 'German (Deutsch)',
        ja: 'Japanese (日本語)'
      };
      const targetName = targetMap[opts.targetLang] || 'Hindi (हिंदी)';
      return `Translate the following text accurately from ${source} to ${targetName}.\nPreserve the exact nuance, contextual meaning, technical terminology, and formatting of the original content.\n\nContent:\n${input}`;
    },
    extraOptions: [
      { id: 'sourceLang', label: 'Source Language', type: 'select', choices: [
        { value: 'auto', label: 'Auto Detect' },
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi (हिंदी)' },
        { value: 'mr', label: 'Marathi (मराठी)' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'ja', label: 'Japanese' }
      ], default: 'auto' },
      { id: 'targetLang', label: 'Target Language', type: 'select', choices: [
        { value: 'hi', label: 'Hindi (हिंदी)' },
        { value: 'mr', label: 'Marathi (मराठी)' },
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish (Español)' },
        { value: 'fr', label: 'French (Français)' },
        { value: 'de', label: 'German (Deutsch)' },
        { value: 'ja', label: 'Japanese (日本語)' }
      ], default: 'hi' }
    ]
  },

  convert: {
    id: 'convert',
    label: 'Format Conversion',
    icon: 'ri-file-transfer-line',
    color: 'orange',
    desc: 'Transform content into Paragraphs, Bullets, Markdown, Validated JSON, Email, or Report',
    buildPrompt(input, opts = {}) {
      const format = opts.targetFormat || 'bullets';
      if (format === 'json') {
        return `Convert the following content into valid, parseable JSON strictly matching this schema:
{
  "title": "string",
  "summary": "string",
  "sections": [
    { "heading": "string", "points": ["string"] }
  ],
  "entities": ["string"],
  "metadata": { "wordCount": number, "category": "string" }
}
Output ONLY the raw JSON object. Do not include markdown code fence formatting or commentary.\n\nContent:\n${input}`;
      }
      return `Convert and format the following text into the format: ${format.toUpperCase()}.\nEnsure the layout is clean, professional, and visually structured.\n\nContent:\n${input}`;
    },
    extraOptions: [
      { id: 'targetFormat', label: 'Target Format', type: 'select', choices: [
        { value: 'paragraph', label: 'Cohesive Paragraphs' },
        { value: 'bullets', label: 'Bullet Points' },
        { value: 'numbered', label: 'Numbered List' },
        { value: 'markdown', label: 'Rich Markdown Document' },
        { value: 'json', label: 'Structured JSON (Validated)' },
        { value: 'email', label: 'Professional Email' },
        { value: 'report', label: 'Formal Executive Report' }
      ], default: 'bullets' }
    ]
  },

  grammar: {
    id: 'grammar',
    label: 'Grammar & Spell Check',
    icon: 'ri-spell-check-line',
    color: 'purple',
    desc: 'Hybrid grammar correction: AI-powered with automatic offline fallback & visual diff',
    buildPrompt(input, opts = {}) {
      return `You are an expert grammar and copy editor. Correct all grammatical errors, subject-verb disagreement, verb tense/form errors, missing articles, spelling mistakes, typos, and punctuation faults in the following text.
Strict Requirements:
1. Preserve the intended meaning, factual information, personal names, and author voice.
2. Return ONLY the clean corrected text. Do NOT add preamble, conversational notes, or explanations unless explicitly asked.

Text to correct:
${input}`;
    },
    extraOptions: [
      { id: 'mode', label: 'Correction Mode', type: 'select', choices: [
        { value: 'hybrid', label: 'Hybrid (AI with Auto Fallback)' },
        { value: 'ai', label: 'Mode A: AI-Powered' },
        { value: 'offline', label: 'Mode B: Offline Local Engine' }
      ], default: 'hybrid' },
      { id: 'autoFallback', label: 'Automatic Offline Fallback', type: 'select', choices: [
        { value: 'yes', label: 'Enabled (Fallback to Local on AI Error)' },
        { value: 'no', label: 'Disabled (Show AI Error)' }
      ], default: 'yes' },
      { id: 'showDiff', label: 'Display Comparison', type: 'select', choices: [
        { value: 'yes', label: 'Show Visual Diff' },
        { value: 'no', label: 'Clean Corrected Text Only' }
      ], default: 'yes' }
    ]
  },

  expand: {
    id: 'expand',
    label: 'Content Expansion',
    icon: 'ri-zoom-in-line',
    color: 'cyan',
    desc: 'Expand short text into detailed, well-structured content without unnecessary filler',
    buildPrompt(input, opts = {}) {
      const level = opts.expansionLevel || '2x';
      return `Expand the following concise text into a comprehensive, richly structured document (Target Expansion: ~${level}).\nElaborate on core ideas with clear background context, mechanisms, illustrative examples, and practical implications.\nStrictly avoid repetitive fluff, circular phrasing, or ungrounded claims.\n\nContent:\n${input}`;
    },
    extraOptions: [
      { id: 'expansionLevel', label: 'Expansion Level', type: 'select', choices: [
        { value: '1.5x', label: '1.5x (Light Elaboration)' },
        { value: '2x', label: '2.0x (Moderate Depth)' },
        { value: '3x', label: '3.0x (In-Depth Analysis)' }
      ], default: '2x' }
    ]
  },

  simplify: {
    id: 'simplify',
    label: 'Content Simplification',
    icon: 'ri-lightbulb-line',
    color: 'green',
    desc: 'Rewrite complex text into accessible, plain language with Flesch score tracking',
    buildPrompt(input, opts = {}) {
      const level = opts.readingLevel || 'plain-english';
      const instructions = {
        'elementary': 'children or elementary students (5th grade reading level). Use short sentences and relatable everyday analogies.',
        'middle-school': 'middle school readers (8th grade reading level). Remove complex jargon and use clear, direct phrasing.',
        'plain-english': 'general adult public in clean Hemingway-style Plain English. Active voice, zero corporate jargon, retaining technical accuracy.'
      };
      return `Simplify and rewrite the following content for: ${instructions[level] || instructions['plain-english']}.\nCrucial: Maintain accurate meaning and facts while significantly reducing cognitive load.\n\nContent:\n${input}`;
    },
    extraOptions: [
      { id: 'readingLevel', label: 'Reading Level', type: 'select', choices: [
        { value: 'plain-english', label: 'Plain English (General Public)' },
        { value: 'middle-school', label: 'Middle School (8th Grade)' },
        { value: 'elementary', label: 'Elementary (5th Grade)' }
      ], default: 'plain-english' }
    ]
  },

  quality: {
    id: 'quality',
    label: 'Quality Scoring',
    icon: 'ri-award-line',
    color: 'orange',
    desc: 'Score content across Grammar, Clarity, Readability, Coherence, and Structure (0-100)',
    buildPrompt(input, opts = {}) {
      return `Perform an in-depth Content Quality Evaluation on the following text.
Output a JSON response with the exact schema:
{
  "overall": number (0-100),
  "breakdown": {
    "grammar": number (0-100),
    "clarity": number (0-100),
    "readability": number (0-100),
    "coherence": number (0-100),
    "structure": number (0-100),
    "relevance": number (0-100)
  },
  "fleschScore": number (0-100),
  "explanation": "string summary of strengths and weaknesses",
  "suggestions": ["concrete actionable improvement suggestion 1", "suggestion 2"]
}
Output strictly valid JSON with no markdown wrapping.\n\nContent:\n${input}`;
    },
    extraOptions: [
      { id: 'evaluationStandard', label: 'Standard', type: 'select', choices: [
        { value: 'general', label: 'General Readability' },
        { value: 'business', label: 'Business & Executive' },
        { value: 'academic', label: 'Academic & Publishing' }
      ], default: 'general' }
    ]
  }
};

const PIPELINE_PRESETS = [
  {
    id: 'blog-social-kit',
    name: 'Blog → Social Media Kit',
    icon: 'ri-layout-masonry-line',
    desc: 'Turn long blog posts into polished, professional social media packages',
    color: 'purple',
    stages: [
      { type: 'grammar', opts: { showDiff: 'no' } },
      { type: 'tone', opts: { targetTone: 'professional' } },
      { type: 'summarize', opts: { length: 'short' } },
      { type: 'convert', opts: { targetFormat: 'bullets' } }
    ]
  },
  {
    id: 'video-newsletter',
    name: 'Transcript → Newsletter',
    icon: 'ri-mail-line',
    desc: 'Transform raw video transcripts into clean, readable email newsletters',
    color: 'cyan',
    stages: [
      { type: 'grammar', opts: { showDiff: 'no' } },
      { type: 'simplify', opts: { readingLevel: 'plain-english' } },
      { type: 'convert', opts: { targetFormat: 'email' } }
    ]
  },
  {
    id: 'report-exec',
    name: 'Report → Executive Briefing',
    icon: 'ri-briefcase-line',
    desc: 'Condense detailed technical reports into structured executive briefings',
    color: 'green',
    stages: [
      { type: 'summarize', opts: { length: 'detailed' } },
      { type: 'tone', opts: { targetTone: 'formal' } },
      { type: 'convert', opts: { targetFormat: 'report' } },
      { type: 'quality', opts: { evaluationStandard: 'business' } }
    ]
  },
  {
    id: 'multilang',
    name: 'Multilingual Global Dispatch',
    icon: 'ri-global-line',
    desc: 'Polish English text and translate into Hindi for regional reach',
    color: 'orange',
    stages: [
      { type: 'grammar', opts: { showDiff: 'no' } },
      { type: 'tone', opts: { targetTone: 'friendly' } },
      { type: 'translate', opts: { sourceLang: 'en', targetLang: 'hi' } }
    ]
  },
  {
    id: 'technical-plain',
    name: 'Technical → Plain English',
    icon: 'ri-lightbulb-flash-line',
    desc: 'De-jargonize academic or technical documents into clear public English',
    color: 'purple',
    stages: [
      { type: 'simplify', opts: { readingLevel: 'plain-english' } },
      { type: 'expand', opts: { expansionLevel: '1.5x' } },
      { type: 'quality', opts: { evaluationStandard: 'general' } }
    ]
  }
];

function getTransformationTypes() {
  return Object.values(TRANSFORMATIONS);
}
