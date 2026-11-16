# Builds dialogue.wav + lines.json/lines.js/env.js for both episodes of a recording batch (vertical series).
# usage: python3 assemble_pair.py <project> ; line lists below
import json, wave, sys, numpy as np
SR = 44100
EP = {
 "sakhan": ("السخان النووي", 3.4, [
  ("mom", "r3", 0.23, 3.26, 0.15, "إبراهيم! الشقة كلها بقت حمّام بخار!", "Ibrahim! The whole flat turned into a steam bath!"),
  ("son", "r1", 0.02, 3.38, 1.25, "بابا! السخان بايظ... والمية تلج!", "Dad! The water heater's broken... the water's ice!"),
  ("dad", "r1", 4.04, 9.23, 0.25, "ولا يهمك يا بطل... قدامك: السخان النووي تلاتة آلاف!", "Don't worry, champ... behold: the Nuclear Water Heater 3000!"),
  ("son", "r1", 9.82, 12.50, 0.25, "ده الكاتل والسشوار والطاسة يا بابا!", "That's the kettle, the hair dryer and the pan, Dad!"),
  ("dad", "r1", 13.31, 15.80, 0.3, "ادخل استحمى... وأنا هدوس على التوربو.", "Go shower... I'll hit the turbo."),
  ("son", "r1", 16.63, 19.33, 0.9, "بابا! المية بتغلي!... أنا اتسلقت!", "Dad! The water's boiling!... I'm cooked!"),
  ("mom", "r3", 0.23, 3.26, 0.5, "إبراهيم! الشقة كلها بقت حمّام بخار!", "Ibrahim! The whole flat turned into a steam bath!"),
  ("dad", "r1", 20.02, 22.59, 0.4, "يبقى نفتحها سبا... ونلم فلوس.", "Then we open a spa... and make money."),
  ("anno", "r3", 11.42, 15.69, 0.5, "", "Water temperature: boiling. Apartment: sauna."),
 ]),
 "mobile-dryer": ("مجفف الموبايلات النووي", 3.4, [
  ("mom", "r3", 8.79, 10.65, 0.15, "إبراهيم! الرز بيرن!", "Ibrahim! The rice is ringing!"),
  ("son", "r2", 0.12, 2.43, 1.35, "بابا! الموبايل وقع في الحمام!", "Dad! My phone fell in the toilet!"),
  ("dad", "r2", 3.03, 7.28, 0.25, "ولا يهمك... قدامك: مجفف الموبايلات النووي تلاتة آلاف!", "Don't worry... behold: the Nuclear Phone Dryer 3000!"),
  ("son", "r2", 7.69, 8.90, 0.25, "دي حلة الرز يا بابا!", "That's the rice pot, Dad!"),
  ("dad", "r2", 9.34, 12.02, 0.3, "الرز بيشفط المية... وأنا هزوّد عليه نار.", "Rice soaks up the water... and I'll add some fire."),
  ("mom", "r3", 4.88, 8.05, 0.9, "حد شاف حلة الرز؟... الضيوف وصلوا!", "Has anyone seen the rice pot?... the guests are here!"),
  ("mom", "r3", 8.79, 10.65, 1.3, "إبراهيم! الرز بيرن!", "Ibrahim! The rice is ringing!"),
  ("son", "r2", 12.45, 16.03, 0.5, "الموبايل اشتغل يا بابا!... بس ريحته رز بالشعرية.", "The phone works, Dad!... but it smells like vermicelli rice."),
  ("anno", "r3", 18.23, 23.17, 0.5, "", "Phone status: alive. Rice status: ringing."),
 ]),
 "takyeef": ("التكييف النووي", 3.4, [
  ("mom", "r3", 0.22, 5.41, 0.15, "إبراهيم!... فاتورة الكهربا جت... بخمس تلاف جنيه!", "Ibrahim!... the electricity bill came... five thousand pounds!"),
  ("son", "r1", 0.24, 3.20, 1.25, "بابا! أنا بسيح... الحر ده مش طبيعي!", "Dad! I'm melting... this heat isn't normal!"),
  ("dad", "r1", 4.04, 8.32, 0.25, "ولا يهمك يا بطل... قدامك: التكييف النووي تلاتة آلاف!", "Don't worry, champ... behold: the Nuclear AC 3000!"),
  ("son", "r1", 8.87, 12.14, 0.25, "دي التلاجة مفتوحة والمروحة قدامها يا بابا!", "That's the open fridge with a fan in front of it, Dad!"),
  ("dad", "r1", 12.84, 16.67, 0.3, "هوا التلاجة... بالمروحة... يبقى تكييف. اقعد قدامه.", "Fridge air... plus fan... equals AC. Sit in front of it."),
  ("son", "r1", 17.35, 21.00, 0.9, "بابا... أنا اتجمدت!... حواجبي فيها تلج!", "Dad... I'm frozen!... there's ice in my eyebrows!"),
  ("mom", "r3", 0.22, 5.41, 0.5, "إبراهيم!... فاتورة الكهربا جت... بخمس تلاف جنيه!", "Ibrahim!... the electricity bill came... five thousand pounds!"),
  ("dad", "r1", 21.73, 24.82, 0.4, "خلاص... ندفعها بالتلج... عندنا كتير.", "Fine... we'll pay it in ice... we have plenty."),
  ("anno", "r3", 12.53, 18.88, 0.5, "", "Room temperature: minus ten. Electricity bill: nuclear."),
 ]),
 "natiga": ("موقع النتيجة", 3.4, [
  ("mom", "r3", 7.16, 11.38, 0.15, "إبراهيم! إنت وقّعت موقع النتيجة للمحافظة كلها؟!", "Ibrahim! You crashed the results website for the whole governorate?!"),
  ("son", "r2", 0.05, 3.30, 1.25, "بابا! موقع النتيجة واقع... والناس كلها مستنية!", "Dad! The results website is down... and everyone's waiting!"),
  ("dad", "r2", 3.81, 8.06, 0.25, "ولا يهمك... قدامك: مسرّع المواقع النووي تلاتة آلاف!", "Don't worry... behold: the Nuclear Website Booster 3000!"),
  ("son", "r2", 8.81, 10.69, 0.25, "ده الراوتر متربط في المروحة يا بابا!", "That's the router tied to the fan, Dad!"),
  ("dad", "r2", 11.36, 15.17, 0.3, "المروحة بتزق النت... والنت بيجري. اكتب رقم الجلوس.", "The fan pushes the internet... and the internet runs. Type your seat number."),
  ("son", "r2", 15.91, 19.56, 0.5, "اشتغل!... أنا جبت... خمسين في المية؟!", "It works!... I got... fifty percent?!"),
  ("mom", "r3", 7.16, 11.38, 0.5, "إبراهيم! إنت وقّعت موقع النتيجة للمحافظة كلها؟!", "Ibrahim! You crashed the results website for the whole governorate?!"),
  ("dad", "r2", 19.75, 24.86, 0.4, "بالعكس... أنا خليت المحافظة كلها تشوف نتيجة حمادة.", "On the contrary... I let the whole governorate see Hamada's result."),
  ("anno", "r3", 21.28, 26.76, 0.5, "", "Server status: down. Hamada's score: fifty percent."),
 ]),
 "abu-samir-car": ("عربية أبو سمير", 3.4, [
  ("samir", "r1", 13.82, 17.56, 0.15, "تلاتة آلاف جنيه؟! ده أنا جايب العربية بألفين!", "Three thousand pounds?! I bought the car for two!"),
  ("bastam", "r1", 0.15, 3.90, 1.25, "يا جزاااار! يا أصلييي! زبون!", "Gazzaaar! Asliii! Customer!"),
  ("samir", "r1", 4.52, 9.53, 0.3, "العربية بتعمل صوت غريب... زي ما تكون بتعيّط.", "The car's making a strange noise... like it's crying."),
  ("asly", "r2", 0.12, 3.13, 0.3, "مين اللي عمل التوصيلات دي بشريط لزق؟! أنا هضربه!", "Who did this wiring with duct tape?! I'll beat him up!"),
  ("samir", "r1", 9.96, 13.43, 0.3, "أنا!... من سنة تمانين.", "Me!... back in 1980."),
  ("gazzar", "r2", 3.78, 8.16, 0.4, "العربية مش عطلانة... العربية زعلانة.", "The car isn't broken... the car is sad."),
  ("alamy", "r3", 1.13, 6.46, 0.4, "السيستم بيقول: العربية محتاجة حب... وتلات تلاف جنيه.", "The system says: the car needs love... and three thousand pounds."),
  ("samir", "r1", 13.82, 17.56, 0.35, "تلاتة آلاف جنيه؟! ده أنا جايب العربية بألفين!", "Three thousand pounds?! I bought the car for two!"),
  ("bastam", "r1", 17.96, 20.53, 0.35, "خلاص... خد العربية وسيبلنا الكلاكس.", "Fine... take the car and leave us the horn."),
  ("anno", "r4", 0.0, 6.56, 0.5, "", "Car status: emotional. Bill: three thousand."),
 ]),
 "vacuum": ("المكنسة النووية", 3.0, [
  ("mom", "r2", 0.06, 5.44, 0.15, "إبراهيم! المكنسة شفطت الستارة... والسجادة... وحمادة!", "Ibrahim! The vacuum sucked up the curtain... the carpet... and Hamada!"),
  ("son", "r1", 0.04, 3.45, 0.85, "بابا... إنت بتعمل إيه بالشنيور ده الساعة اتنين بالليل؟!", "Dad... what are you doing with that drill at 2 AM?!"),
  ("dad", "r1", 4.25, 11.88, 0.25, "ششش... أنا في مرحلة التصنيع... قدامك: المكنسة النووية تلاتة آلاف!", "Shhh... I'm in the manufacturing phase... behold: the Nuclear Vacuum 3000!"),
  ("son", "r1", 12.59, 17.51, 0.25, "ده موتور الغسالة... ومعاه خرطوم المية... ودي حلة أمي!", "That's the washing machine motor... with the water hose... and Mom's pot!"),
  ("dad", "r1", 18.20, 21.88, 0.3, "كل اختراع عظيم... بيبدأ بحلة أمك. شغّل.", "Every great invention... starts with your mom's pot. Switch it on."),
  ("son", "r1", 22.66, 25.63, 0.4, "بابا! دي بتشفط... بتشفطني أنااا!", "Dad! It's sucking... it's sucking ME!"),
  ("mom", "r2", 0.06, 5.44, 0.35, "إبراهيم! المكنسة شفطت الستارة... والسجادة... وحمادة!", "Ibrahim! The vacuum sucked up the curtain... the carpet... and Hamada!"),
  ("dad", "r1", 26.20, 31.01, 0.4, "ممتاز... نكتب في الكشكول: الاختراع شغّال... بزيادة.", "Excellent... let's write in the notebook: the invention works... too well."),
  ("anno", "r2", 6.00, 12.62, 0.3, "", "Manufacturing complete. Suction: maximum. Hamada: missing."),
 ]),
 "asly-work": ("الأصلي بيشتغل", 3.0, [
  ("asly", "r1", 16.55, 18.79, 0.15, "الشاي؟! تعالى هنا يا بستم!", "Tea?! Get over here, Bestem!"),
  ("asly", "r1", 0.02, 7.23, 0.85, "ششش... السلك الأحمر في الأحمر... والأزرق في الأزرق... محدش يتنفس.", "Shhh... red wire to red... blue to blue... nobody breathe."),
  ("bastam", "r1", 7.78, 9.58, 0.3, "يا أصلييييي!", "ASLIIIII!"),
  ("asly", "r1", 9.92, 13.35, 1.0, "مين... اللي... زعق؟!", "Who... just... yelled?!"),
  ("bastam", "r1", 13.78, 16.13, 0.3, "أنا... كنت عايز أقولك الشاي جاهز.", "Me... I wanted to tell you the tea's ready."),
  ("asly", "r1", 16.55, 18.79, 0.3, "الشاي؟! تعالى هنا يا بستم!", "Tea?! Get over here, Bestem!"),
  ("bastam", "r1", 19.15, 20.67, 0.25, "يا جزاااار! الحقني!", "Gazzaaar! Help me!"),
  ("alamy", "r2", 0.12, 4.24, 1.4, "الكاميرات سجلت كل حاجة... والفيديو عامل مليون مشاهدة.", "The cameras caught everything... and the video has a million views."),
  ("anno", "r2", 5.51, 11.44, 0.35, "", "Electrician rage: maximum. Bestem: launched."),
 ]),
 "asly-sharka": ("أصلي شركة", 3.0, [
  ("asly", "r1", 10.94, 13.29, 0.15, "سيبوني عليه! ده بيقول اسمي في كل جملة!", "Let me at him! He says my name in every sentence!"),
  ("samir", "r2", 0.23, 2.90, 0.85, "الفلتر ده أصلي ولا تقليد يا ابني؟", "Is this filter genuine or fake, son?"),
  ("bastam", "r1", 0.02, 2.86, 0.3, "أصلي شركة يا حاج! أصلي أصلي!", "Genuine OEM, sir! Genuine, genuine!"),
  ("asly", "r1", 3.90, 6.07, 0.4, "إنت بتنادي عليا... ولا بتتريق عليا؟!", "Are you calling me... or mocking me?!"),
  ("bastam", "r1", 7.20, 9.92, 0.3, "لا والله... أصلي... أصلي كنت بقول أصلي!", "No, I swear... I was... I was saying genuine!"),
  ("asly", "r1", 10.94, 13.29, 0.9, "سيبوني عليه! ده بيقول اسمي في كل جملة!", "Let me at him! He says my name in every sentence!"),
  ("alamy", "r2", 8.48, 11.42, 0.3, "اهدى يا أصلي! ده كلام قطع غيار!", "Calm down, Asly! It's spare-parts talk!"),
  ("gazzar", "r3", 0.20, 6.57, 0.3, "سيبه يا أصلي... ده مش قصده... أصلي... قصدي... خلاص.", "Leave him, Asly... he didn't mean it... because... I mean... never mind."),
  ("asly", "r1", 14.69, 15.86, 0.3, "حتى إنت يا جزار؟!", "You too, Gazzar?!"),
  ("samir", "r2", 4.46, 7.63, 0.4, "طب أنا هاخد الفلتر التقليد... أسلم.", "Fine, I'll take the fake filter... it's safer."),
  ("anno", "r3", 7.44, 12.50, 0.35, "", "Genuine part: confirmed. Bestem: still hanging."),
 ]),
 "uber": ("أوبر إبراهيم", 3.0, [
  ("shehata", "r2", 5.65, 8.54, 0.15, "يا أستاذ! العربية بتطير ليه؟!", "Mister! Why is the car flying?!"),
  ("mom", "r2", 9.52, 12.92, 0.85, "خلاص يا إبراهيم... مفيش اختراعات. شوفلك شغلانة عادية.", "That's it, Ibrahim... no more inventions. Find a normal job."),
  ("dad", "r1", 0.21, 2.79, 0.3, "هشتغل أوبر... بعربية أبو سمير.", "I'll drive Uber... in Abu Samir's car."),
  ("sayed", "r1", 4.14, 8.11, 1.0, "على مهلك يا ابني... إيه الزرار الأحمر ده؟", "Easy, son... what's that red button?"),
  ("dad", "r1", 8.92, 10.53, 0.3, "ده... ده تكييف.", "That's... that's the AC."),
  ("sayed", "r4", 0.20, 4.68, 0.35, "تكييف؟ طب ما تشغّله... الجو حر.", "AC? Then turn it on... it's hot."),
  ("dad", "r4", 5.32, 6.92, 0.3, "لا لا... التكييف ده بيبوّظ الكاوتش.", "No, no... this AC ruins the tyres."),
  ("shehata", "r5", 0.27, 3.62, 0.4, "يا أسطى إنت ماشي في الطريق الغلط!... الجي بي إس بيقول يمين!", "Driver, you're going the wrong way!... the GPS says right!"),
  ("dad", "r4", 10.56, 13.11, 0.3, "الجي بي إس ده مش فاهم حاجة... أنا عندي طريق مختصر.", "That GPS knows nothing... I've got a shortcut."),
  ("shehata", "r2", 0.11, 1.93, 0.35, "بسرعة يا أسطى! السوق هيقفل!", "Hurry up, driver! The market's closing!"),
  ("dad", "r1", 12.23, 14.23, 0.3, "بسرعة؟... امسك في البطيخ.", "Hurry?... hold on to the melons."),
  ("shehata", "r2", 5.65, 8.54, 1.8, "يا أستاذ! العربية بتطير ليه؟!", "Mister! Why is the car flying?!"),
  ("dad", "r1", 16.01, 18.61, 0.35, "دي مش اختراع... دي أوبر بريميوم.", "It's not an invention... it's Uber Premium."),
  ("sayed", "r4", 13.68, 17.21, 0.6, "يا ابني... هو التكييف ده بيطيّر؟", "Son... does this AC make things fly?"),
  ("anno", "r3", 0.30, 4.76, 0.6, "", "Rating: one star. Ibrahim: grounded."),
 ]),
 "life-story": ("حكاية المخترع العالمي", 3.0, [
  ("dad", "r1", 0.18, 3.02, 0.15, "وعشان كده... أنا عايش على البلكونة.", "And that's why... I live on the balcony."),
  ("dad", "r1", 4.01, 11.52, 1.25, "أنا إبراهيم... اتولدت سنة خمسة وسبعين... وأول كلمة قلتها مكانتش ماما... كانت: مفك.", "I'm Ibrahim... born in '75... and my first word wasn't mama... it was: screwdriver."),
  ("teta", "r2", 0.25, 2.48, 0.3, "يا إبراهيم! فكّيت السرير تاني؟!", "Ibrahim! You took the crib apart again?!"),
  ("dad", "r1", 12.43, 16.82, 0.45, "في المدرسة... عملت مشروع العلوم: بركان. المدرسة اتقفلت أسبوع.", "At school... my science project: a volcano. School closed for a week."),
  ("dad", "r1", 17.82, 20.35, 0.45, "وفي الجامعة... قابلت أحلى بنت في الدنيا.", "At university... I met the prettiest girl in the world."),
  ("mom", "r2", 3.30, 3.90, 0.3, "إنت مين؟", "Who are you?"),
  ("dad", "r1", 21.28, 24.16, 0.3, "أنا المخترع العالمي... وده عصير اخترعته.", "I'm the world-famous inventor... and here's a juice I invented."),
  ("mom", "r2", 4.89, 9.34, 0.5, "إنت مجنون... بس عاجبني.", "You're crazy... but I like you."),
  ("dad", "r1", 25.00, 28.67, 0.45, "واتجوزنا... وفي الفرح عملت أول صواريخ نووية.", "We got married... and at the wedding I made my first nuclear fireworks."),
  ("dad", "r1", 29.50, 32.25, 0.45, "وبعدين جه حمادة... وعملتله سرير هزاز تيربو.", "Then came Hamada... and I built him a turbo rocking crib."),
  ("dad", "r1", 33.11, 36.47, 0.4, "ومن ساعتها... وأنا بخترع... وأم حمادة بتطلّعني البلكونة.", "Ever since... I keep inventing... and Om Hamada keeps sending me to the balcony."),
  ("mom", "r2", 10.34, 13.11, 0.4, "إبراهيم! إنت بتحكي لمين؟!", "Ibrahim! Who are you talking to?!"),
  ("dad", "r1", 37.45, 38.48, 0.3, "للمتابعين يا حبيبتي.", "To the followers, darling."),
  ("anno", "r3", 0.34, 6.59, 0.5, "", "Life story unlocked. Balcony years: twenty-five."),
 ]),
}
P0 = "/home/user/OpenMontage/projects/"
name = sys.argv[1]; title, tail, L = EP[name]; P = P0 + name
def load(r):
    w = wave.open(f"{P}/assets/audio/google/{r}_44.wav"); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
REC = {r: load(r) for r in sorted(set(l[1] for l in L))}
PAD = 0.04
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def voiced(x, minsil=0.12):
    hop = int(SR * 0.01); e = np.array([rms(x[i:i + hop]) for i in range(0, len(x) - hop, hop)])
    db = 20 * np.log10(e + 1e-9); sp = db > db.max() - 34; segs = []; i = 0; n = len(sp)
    while i < n:
        if sp[i]:
            j = i
            while j < n:
                if not sp[j]:
                    k = j
                    while k < n and not sp[k]: k += 1
                    if k - j >= int(minsil * 100) or k == n: break
                    j = k
                else: j += 1
            if j - i > 8: segs.append((i / 100, j / 100))
            i = j
        else: i += 1
    return segs
MAXGAP = float(sys.argv[2]) if len(sys.argv) > 2 else 0  # shrink pauses inside a line to at most this (s); 0 = off
def squeeze(x):
    if not MAXGAP: return x
    v = voiced(x); parts = []; last = 0
    for p, q in v:
        gap0 = int(last * SR); p0 = int(p * SR)
        if p0 - gap0 > int(MAXGAP * SR) and last > 0: parts.append(x[gap0:gap0 + int(MAXGAP * SR)])
        else: parts.append(x[gap0:p0])
        parts.append(x[p0:int(q * SR)]); last = q
    parts.append(x[int(last * SR):]); return np.concatenate(parts)
clips = []
for s, r, a, b, pb, ar, en in L:
    x = squeeze(REC[r][max(0, int((a - PAD) * SR)):int((b + PAD) * SR)].copy()); v = voiced(x)
    clips.append([s, r, a, b, pb, ar, en, x, v, rms(np.concatenate([x[int(p * SR):int(q * SR)] for p, q in v]))])
med = np.median([c[9] for c in clips]); t = 0.0; out = []; lines = []
for i, (s, r, a, b, pb, ar, en, x, v, vr) in enumerate(clips):
    t += pb; g = float(np.clip(med / vr, 0.6, 3.0)); y = x * g; f = int(0.01 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    t0 = round(t, 3); out.append((int(t0 * SR), y)); t1 = round(t0 + len(y) / SR, 3)
    lines.append({"id": f"L{i+1:02d}", "s": s, "t0": t0, "t1": t1, "src": [r, a, b], "gain": round(g, 2), "ar": ar, "en": en, "vox": [[round(t0 + p, 2), round(t0 + q, 2)] for p, q in v]}); t = t1
for i, l in enumerate(lines): l["gap_after"] = round((lines[i + 1]["t0"] - l["t1"]) if i + 1 < len(lines) else 0.4, 2)
DUR = round(t + tail, 1); buf = np.zeros(int(DUR * SR))
for i0, y in out: buf[i0:i0 + len(y)] += y
buf = np.clip(buf, -1, 1)
w = wave.open(f"{P}/assets/audio/dialogue.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype(np.int16).tobytes()); w.close()
D = {"title": title, "voice_source": "Google AI Studio via local Claude-in-Chrome session (Puck=Hamada, Orus=Ibrahim, Kore=Om Hamada, Algenib=announcer)", "dur": DUR, "lines": lines}
json.dump(D, open(f"{P}/artifacts/lines.json", "w"), ensure_ascii=False, indent=1)
open(f"{P}/build/lines.js", "w").write("window.LINES_DATA=" + json.dumps(D, ensure_ascii=False) + ";")
hop = SR // 30; env = np.array([rms(buf[i:i + hop]) for i in range(0, len(buf), hop)]); env = np.clip(env / np.percentile(env[env > 0.003], 95), 0, 1)
open(f"{P}/build/env.js", "w").write("window.ENV=" + json.dumps({"fps": 30, "env": [round(float(e), 3) for e in env]}) + ";")
for l in lines: print(l["id"], l["s"], l["t0"], l["t1"], l["gain"], l["vox"])
print("DUR", DUR)
