// Registre des articles de blog (contenu first-party).
// Règles éditoriales : ai/marketing/blog-guidelines.md
// Chaque article : métadonnées SEO + corps HTML (rendu via .prose-atlas).

const threeActsDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 250" role="img" aria-label="Schéma de la structure en trois actes et de la montée de la tension" style="width:100%;height:auto">
    <!-- courbe de tension -->
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="0,112 120,98 180,86 300,70 360,58 480,76 540,90 600,44 632,26 720,70"/>
    <!-- bandes d'actes -->
    <g>
      <rect x="0"   y="132" width="176" height="54" rx="8" fill="#5cae8e" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.14"/>
      <rect x="184" y="132" width="352" height="54" rx="8" fill="#cba15e" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.14"/>
      <rect x="544" y="132" width="176" height="54" rx="8" fill="#5cae8e" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.14"/>
    </g>
    <g font-family="'Spectral',Georgia,serif" fill="#ece7db" font-size="15" text-anchor="middle">
      <text x="88"  y="162">Acte 1</text>
      <text x="360" y="162">Acte 2</text>
      <text x="632" y="162">Acte 3</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" fill="#a9a291" font-size="11" text-anchor="middle">
      <text x="88"  y="178">≈ 25 %</text>
      <text x="360" y="178">≈ 50 %</text>
      <text x="632" y="178">≈ 25 %</text>
    </g>
    <!-- repères -->
    <g>
      <circle cx="180" cy="86" r="4" fill="#cba15e"/>
      <circle cx="360" cy="58" r="4" fill="#cba15e"/>
      <circle cx="632" cy="26" r="4" fill="#cba15e"/>
    </g>
    <g font-family="'Spectral',Georgia,serif" fill="#a9a291" font-size="12.5" text-anchor="middle">
      <text x="180" y="222">Déclencheur</text>
      <text x="360" y="222">Midpoint</text>
      <text x="632" y="222">Climax</text>
    </g>
    <g stroke="#ffffff" stroke-opacity="0.14">
      <line x1="180" y1="90" x2="180" y2="132"/>
      <line x1="360" y1="62" x2="360" y2="132"/>
      <line x1="632" y1="30" x2="632" y2="132"/>
    </g>
  </svg>
  <figcaption>La structure en trois actes : proportions et montée de la tension. La courbe verte figure l'intensité dramatique.</figcaption>
</figure>`;

const commentStructurerUnRoman = {
  slug: 'comment-structurer-un-roman',
  pillar: 'P1',
  metaTitle: 'Comment structurer un roman : le guide complet',
  title: 'Comment structurer un roman : le guide complet',
  description:
    'Structure en 3 actes, Save the Cat, Voyage du Héros : le guide complet pour structurer ton roman (ou ta saga) sans étouffer ta créativité.',
  excerpt:
    'Trois actes, 15 beats, 12 étapes : les méthodes qui donnent une colonne vertébrale à ton histoire, sans brider ta plume.',
  date: '2026-09-10',
  readingTime: '9 min',
  tags: ['Structure', 'Méthode', 'Save the Cat', 'Voyage du Héros'],
  emoji: '🧭',
  html: `
<p>Tu as une idée qui te tient éveillé la nuit, des personnages plein la tête, peut-être même déjà 30 000 mots posés sur la page. Et pourtant, cette petite voix&#8239;: <em>est-ce que ça tient&#8239;? est-ce que ça va quelque part&#8239;?</em></p>
<p>Structurer un roman, ce n'est pas enfermer ton histoire dans une case. C'est lui donner une colonne vertébrale, celle qui fait qu'un lecteur reste debout à 2h du matin pour connaître la suite. Voici comment t'y prendre, méthode par méthode, sans jargon inutile.</p>

<h2>🧭 Pourquoi structurer (et pourquoi ça ne tue pas la créativité)</h2>
<p>Le débat revient toujours&#8239;: <em>structurer, est-ce que ça ne bride pas l'inspiration&#8239;?</em></p>
<p>C'est un faux débat. Une structure narrative n'est pas un moule, c'est une <strong>charpente</strong>. Personne ne reproche à une cathédrale d'avoir des fondations&#8239;; ce sont elles qui lui permettent de monter haut. Ta structure, c'est pareil&#8239;: elle porte les moments de grâce, elle ne les remplace pas.</p>
<p>Concrètement, structurer te sert à trois choses&#8239;:</p>
<ul>
  <li><strong>Ne plus écrire dans le brouillard.</strong> Tu sais où tu vas, donc tu n'abandonnes pas au chapitre 12 parce que «&#8239;ça part dans tous les sens&#8239;».</li>
  <li><strong>Doser la tension.</strong> Une bonne structure place les révélations, les retournements et les respirations au bon endroit, pas trois coups d'éclat d'affilée puis quarante pages plates.</li>
  <li><strong>Tenir la cohérence.</strong> Surtout si tu écris une saga&#8239;: savoir ce qui a été promis, et où ça doit être payé.</li>
</ul>
<p>Les plus grandes histoires suivent une structure. Les auteurs qui «&#8239;écrivent à l'instinct&#8239;» ont souvent simplement intériorisé ces schémas à force de lire. Autant les connaître.</p>

<h2>🏛️ Les trois grandes structures à connaître</h2>
<h3>1. La structure en trois actes</h3>
<p>C'est le squelette de base, hérité du théâtre. Tout le reste en dérive.</p>
${threeActsDiagram}
<ul>
  <li><strong>Acte 1, la mise en place (≈ 25&#8239;%)</strong>&#8239;: on découvre le monde, le héros, son quotidien. Puis un <strong>élément déclencheur</strong> vient tout bousculer et le lance dans l'aventure.</li>
  <li><strong>Acte 2, la confrontation (≈ 50&#8239;%)</strong>&#8239;: le héros affronte des obstacles croissants. Au milieu, un <strong>point de bascule</strong> (le <em>midpoint</em>) change la donne. La tension monte jusqu'au pire moment.</li>
  <li><strong>Acte 3, la résolution (≈ 25&#8239;%)</strong>&#8239;: climax, dénouement, nouveau monde. Le héros a changé.</li>
</ul>
<p>Simple, universelle, elle marche pour tout. Mais elle reste large&#8239;: c'est une carte à petite échelle. Pour les détails, on passe à des méthodes plus fines.</p>

<h3>2. Save the Cat&#8239;: les 15 beats</h3>
<p>Créée par le scénariste Blake Snyder, cette méthode découpe l'histoire en <strong>15 temps forts</strong> («&#8239;beats&#8239;») ultra-précis. Redoutable pour cadencer une intrigue.</p>
<ol>
  <li><strong>Image d'ouverture</strong>, le ton, le monde en une scène.</li>
  <li><strong>Thème énoncé</strong>, la question morale du récit, glissée l'air de rien.</li>
  <li><strong>Mise en place</strong>, le quotidien du héros et ses failles.</li>
  <li><strong>Catalyseur</strong>, l'événement qui casse la routine.</li>
  <li><strong>Débat</strong>, le héros hésite&#8239;: y aller ou non&#8239;?</li>
  <li><strong>Passage dans le deuxième acte</strong>, il choisit, il plonge.</li>
  <li><strong>Intrigue secondaire (B-story)</strong>, souvent la relation, l'amour, le mentor.</li>
  <li><strong>Fun and games</strong>, la «&#8239;promesse du pitch&#8239;», le cœur de ce qu'on est venu voir.</li>
  <li><strong>Midpoint</strong>, fausse victoire ou fausse défaite qui rebat les cartes.</li>
  <li><strong>Les méchants se rapprochent</strong>, la pression monte, tout se resserre.</li>
  <li><strong>Tout est perdu</strong>, le point le plus bas.</li>
  <li><strong>La nuit noire de l'âme</strong>, le héros touche le fond, puis comprend.</li>
  <li><strong>Passage dans le troisième acte</strong>, la solution émerge, souvent grâce à la B-story.</li>
  <li><strong>Finale</strong>, il applique ce qu'il a appris et l'emporte.</li>
  <li><strong>Image finale</strong>, le miroir de l'ouverture&#8239;: mesure du chemin parcouru.</li>
</ol>
<p><strong>Pour quel genre&#8239;?</strong> Les récits à intrigue forte et rythme soutenu&#8239;: thrillers, comédies, romances, drames, et plus largement le cinéma grand public. <em>Le Roi Lion</em> colle presque parfaitement à ces 15 beats.</p>
<p>Poser ces beats dans un outil comme <strong>Atlas Narratif</strong> t'aide à voir d'un coup d'œil quels temps forts sont solides et lesquels sonnent creux&#8239;: le <em>midpoint</em> mou, par exemple, saute aux yeux.</p>
<figure class="blog-figure">
  <img src="/blog/save-the-cat-frise.png" alt="La frise Save the Cat dans Atlas Narratif : les 15 beats placés sur les chapitres, répartis sur les trois actes, avec leur position idéale." loading="lazy" />
  <figcaption>Les 15 beats de Save the Cat visualisés dans Atlas Narratif (démo&#8239;: Le Seigneur des Anneaux).</figcaption>
</figure>

<h3>3. Le Voyage du Héros&#8239;: les 12 étapes</h3>
<p>Formalisé à partir des travaux de Joseph Campbell, c'est le schéma mythologique par excellence&#8239;: la trame de <em>Star Wars</em>, du <em>Seigneur des Anneaux</em>, de <em>Harry Potter</em>.</p>
<ol>
  <li><strong>Le monde ordinaire</strong>, la vie d'avant.</li>
  <li><strong>L'appel à l'aventure</strong>, une mission, une brèche.</li>
  <li><strong>Le refus de l'appel</strong>, la peur, l'hésitation.</li>
  <li><strong>La rencontre du mentor</strong>, Gandalf, Dumbledore, Obi-Wan.</li>
  <li><strong>Le passage du seuil</strong>, on quitte le monde connu.</li>
  <li><strong>Épreuves, alliés, ennemis</strong>, l'apprentissage du nouveau monde.</li>
  <li><strong>L'approche de la caverne</strong>, on prépare le grand danger.</li>
  <li><strong>L'épreuve suprême</strong>, le face-à-face avec la mort (réelle ou symbolique).</li>
  <li><strong>La récompense</strong>, l'objet, le savoir, la victoire arrachée.</li>
  <li><strong>Le chemin du retour</strong>, les conséquences rattrapent le héros.</li>
  <li><strong>La résurrection</strong>, l'épreuve finale, la transformation définitive.</li>
  <li><strong>Le retour avec l'élixir</strong>, il revient changé, porteur d'un don pour les siens.</li>
</ol>
<p><strong>Pour quel genre&#8239;?</strong> La fantasy, la SF, les récits d'initiation et de quête. Dès qu'un personnage doit <em>grandir</em> en traversant un monde plus grand que lui, le Voyage du Héros brille.</p>
<figure class="blog-figure">
  <img src="/blog/voyage-du-heros.png" alt="La vue Voyage du Héros dans Atlas Narratif : les 12 étapes réparties en trois phases (Départ, Initiation, Retour), chacune reliée à un chapitre." loading="lazy" />
  <figcaption>Les 12 étapes du Voyage du Héros appliquées à l'arc d'Aragorn (démo LOTR).</figcaption>
</figure>

<h2>🧩 Comment choisir ta méthode</h2>
<p>Pas besoin de te marier avec une seule. Repère plutôt ce que sert ton histoire&#8239;:</p>
<ul>
  <li><strong>Ton projet est une quête, une initiation, une transformation intérieure&#8239;?</strong> → Voyage du Héros.</li>
  <li><strong>Ton projet mise sur le rythme, les retournements, une mécanique d'intrigue serrée&#8239;?</strong> → Save the Cat.</li>
  <li><strong>Tu veux juste un cadre souple pour dégrossir&#8239;?</strong> → Trois actes.</li>
</ul>
<p>Astuce de pro&#8239;: beaucoup d'auteurs <strong>combinent</strong>. On cadre les grandes masses en trois actes, on affine le tempo avec les 15 beats, et on vérifie l'évolution du héros avec le Voyage. Les méthodes ne se contredisent pas, elles se regardent sous des angles différents.</p>

<h2>🗺️ Structurer une saga&#8239;: le niveau au-dessus</h2>
<p>Écrire <em>une</em> histoire est difficile. Écrire <em>une série</em> de trois, cinq, sept tomes qui tiennent ensemble, c'est un autre métier. C'est là que la plupart des projets s'effondrent, souvent au tome 2.</p>
<p>Deux notions deviennent vitales&#8239;:</p>
<ul>
  <li><strong>Les amorces et les paiements (plant &amp; payoff).</strong> Une amorce, c'est une promesse&#8239;: l'épée rouillée du chapitre 3, la phrase énigmatique du mentor, la cicatrice inexpliquée. Le paiement, c'est le moment où cette promesse est tenue, parfois <strong>deux tomes plus loin</strong>. Rowling est une maîtresse du genre&#8239;: des détails semés au tome 1 explosent au tome 7. Chaque amorce doit trouver son paiement, sinon le lecteur se sent floué.</li>
  <li><strong>La cohérence de continuité.</strong> Sur 300 000 mots et cinq ans d'écriture, les erreurs se glissent&#8239;: un personnage aux yeux bleus au tome 1 et verts au tome 3, un événement impossible dans ta chronologie, un lieu qui déménage. Ce sont ces détails qui brisent l'immersion.</li>
</ul>
<p>Tenir tout ça de tête est impossible. C'est précisément pour les sagas qu'un <strong>atlas de ton histoire</strong> prend son sens&#8239;: une carte, une timeline, un suivi des amorces d'un tome à l'autre. Atlas Narratif a été pensé pour les séries&#8239;: il relie tes promesses à leurs paiements sur toute la saga et repère automatiquement les incohérences avant tes lecteurs (plus de 12 détecteurs y veillent).</p>
<figure class="blog-figure">
  <img src="/blog/amorces-paiements.png" alt="Le suivi des amorces et paiements dans Atlas Narratif : chaque amorce reliée du chapitre où elle est posée au chapitre où elle est résolue, avec son statut." loading="lazy" />
  <figcaption>Le tracker d'amorces et de paiements : chaque promesse suivie de sa mise en place à sa résolution (démo LOTR).</figcaption>
</figure>

<h2>⚠️ Les erreurs classiques à éviter</h2>
<ul>
  <li><strong>Le midpoint mou.</strong> Si le milieu de ton roman est un ventre creux, tout s'affaisse. Ton point de bascule doit <em>changer la donne</em>, pas meubler.</li>
  <li><strong>Le tome 2 qui part en vrille.</strong> Sans objectif clair propre au tome, la suite devient un simple «&#8239;intermède&#8239;» avant le grand final. Chaque tome a besoin de sa propre colonne vertébrale.</li>
  <li><strong>Les amorces jamais résolues.</strong> Tu as promis, tu ne paies pas&#8239;: le lecteur le sent, même s'il ne sait pas nommer sa frustration.</li>
  <li><strong>Le climax non préparé.</strong> Une résolution qui sort de nulle part (le fameux <em>deus ex machina</em>) trahit un manque de structure en amont.</li>
  <li><strong>Confondre chronologie et ordre des chapitres.</strong> L'ordre où tu <em>racontes</em> n'est pas forcément l'ordre où les choses <em>arrivent</em>. Garde les deux en tête, surtout en thriller.</li>
</ul>

<h2>🪜 Méthode pas-à-pas&#8239;: de l'idée au plan</h2>
<p>Voici une marche à suivre concrète pour passer d'une intuition à une structure solide&#8239;:</p>
<ol>
  <li><strong>Formule ta prémisse en une phrase.</strong> «&#8239;Un jeune fermier découvre qu'il a un pouvoir et doit affronter un empire.&#8239;» Si tu ne peux pas la résumer, l'histoire n'est pas encore claire.</li>
  <li><strong>Choisis ta structure</strong> (trois actes, Save the Cat ou Voyage du Héros) selon ton genre.</li>
  <li><strong>Place tes bornes.</strong> Remplis d'abord les points de passage obligés&#8239;: ouverture, catalyseur, midpoint, tout est perdu, climax, image finale. Le reste se logera entre.</li>
  <li><strong>Repère les trous.</strong> Un beat vide n'est pas un problème, c'est une question à te poser&#8239;: <em>qu'est-ce qui manque ici&#8239;?</em></li>
  <li><strong>Sème tes amorces.</strong> Note ce que tu promets et où tu comptes le payer. Pour une saga, fais-le à l'échelle de la série entière.</li>
  <li><strong>Vérifie l'arc de ton héros.</strong> Compare son état à l'ouverture et à l'image finale&#8239;: a-t-il vraiment changé&#8239;?</li>
  <li><strong>Visualise l'ensemble.</strong> Une fois posé, prends de la hauteur&#8239;: timeline, carte, arc émotionnel. C'est en voyant ton histoire <em>en entier</em> que tu repères ce qui cloche.</li>
</ol>

<h2>✅ En résumé</h2>
<p>Structurer un roman, ce n'est pas renoncer à l'inspiration&#8239;: c'est lui donner de quoi tenir debout. Les trois actes te donnent la carte générale, Save the Cat cadence le rythme, le Voyage du Héros suit la transformation. Choisis, combine, et surtout&#8239;: <strong>garde une vue d'ensemble</strong>, d'autant plus si tu écris une saga.</p>
<p>C'est exactement ce que fait <strong>Atlas Narratif</strong>&#8239;: un outil gratuit pour poser ta structure (Save the Cat ou Voyage du Héros, guidés et illustrés), visualiser ta timeline, ta carte et tes personnages, et traquer les incohérences avant tes lecteurs. Tes textes restent les tiens, chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Structure ton premier roman gratuitement avec Atlas Narratif.</a> Et si tu as déjà un manuscrit, importe-le pour en obtenir la carte en quelques minutes.</p>
`,
};

const saveTheCat15Beats = {
  slug: 'la-methode-save-the-cat-15-beats',
  pillar: 'P1',
  metaTitle: 'La méthode Save the Cat : les 15 beats expliqués',
  title: 'La méthode Save the Cat expliquée : les 15 beats',
  description:
    'Les 15 beats de Save the Cat (Blake Snyder) expliqués un par un, avec des exemples concrets, pour cadencer ton roman de l\'ouverture au climax.',
  excerpt:
    'Les 15 temps forts de Blake Snyder, un par un et illustrés par Le Roi Lion : la méthode la plus précise pour rythmer ton intrigue.',
  date: '2026-09-15',
  readingTime: '8 min',
  tags: ['Save the Cat', 'Méthode', 'Beats', 'Structure'],
  emoji: '🎬',
  html: `
<p>Tu as sûrement déjà croisé le nom&#8239;: Save the Cat. C'est aujourd'hui la méthode de structure la plus utilisée à Hollywood, et de plus en plus par les romanciers. Sa force&#8239;? Elle ne se contente pas de dire «&#8239;il faut trois actes&#8239;»&#8239;: elle te donne 15 repères précis, dans l'ordre, pour savoir exactement où placer chaque temps fort.</p>
<p>Dans ce guide, on décortique les 15 beats un par un, avec un exemple que tu connais par cœur&#8239;: Le Roi Lion, qui colle presque parfaitement à la méthode.</p>

<h2>🐱 D'où vient Save the Cat</h2>
<p>La méthode vient du scénariste Blake Snyder, dans son livre Save the Cat! (2005). Le titre fait référence à une astuce de scénario&#8239;: très tôt, montre ton héros faire quelque chose de bien (sauver un chat) pour que le public s'attache à lui.</p>
<p>Snyder a formalisé ce que les meilleures histoires font d'instinct&#8239;: une progression en 15 étapes qui alterne montées de tension et respirations, jusqu'au climax. Ce n'est pas une recette rigide, c'est une <strong>carte de rythme</strong>. Tu restes libre de ton histoire&#8239;; la méthode t'évite juste de te perdre en route.</p>

<h2>🎬 Les 15 beats, un par un</h2>
<p>Les pourcentages indiquent la position approximative dans le récit. À côté de chaque beat, le moment correspondant dans Le Roi Lion.</p>
<ol>
  <li><strong>Image d'ouverture (0-1&#8239;%)</strong>&#8239;: la toute première image donne le ton et le monde. <em>Le Roi Lion&#8239;: le lever du soleil sur la Terre des Lions, la présentation de Simba au Rocher.</em></li>
  <li><strong>Thème énoncé (~5&#8239;%)</strong>&#8239;: quelqu'un formule, l'air de rien, la leçon que le héros devra apprendre. <em>Mufasa&#8239;: «&#8239;Tout ce que la lumière touche est notre royaume&#8239;» et le cycle de la vie.</em></li>
  <li><strong>Mise en place (1-10&#8239;%)</strong>&#8239;: le quotidien du héros, ses failles, ce qui manque à sa vie. <em>Simba, prince insouciant et un peu vaniteux.</em></li>
  <li><strong>Catalyseur (~10&#8239;%)</strong>&#8239;: l'événement qui casse la routine, sans retour possible. <em>La ruée des gnous et la mort de Mufasa.</em></li>
  <li><strong>Débat (10-20&#8239;%)</strong>&#8239;: le héros hésite, a peur, refuse l'aventure. <em>«&#8239;Sauve-toi et ne reviens jamais&#8239;»&#8239;: Simba fuit, écrasé par la culpabilité.</em></li>
  <li><strong>Passage au deuxième acte (~20&#8239;%)</strong>&#8239;: il fait un choix et bascule dans un nouveau monde. <em>Simba quitte le royaume pour la jungle.</em></li>
  <li><strong>Intrigue secondaire / B-story (~22&#8239;%)</strong>&#8239;: une relation qui porte le thème. <em>Timon et Pumbaa (puis Nala) entrent en scène.</em></li>
  <li><strong>Fun and games (20-50&#8239;%)</strong>&#8239;: la «&#8239;promesse du pitch&#8239;», ce pour quoi on est venu. <em>«&#8239;Hakuna Matata&#8239;»&#8239;: la vie insouciante loin des responsabilités.</em></li>
  <li><strong>Point médian / midpoint (~50&#8239;%)</strong>&#8239;: fausse victoire ou fausse défaite qui rebat les cartes. <em>Nala retrouve Simba&#8239;: joie des retrouvailles, mais le royaume est en ruine.</em></li>
  <li><strong>Les méchants se rapprochent (50-75&#8239;%)</strong>&#8239;: la pression monte, les alliés vacillent. <em>Simba refuse de rentrer, se dispute avec Nala, doute de lui.</em></li>
  <li><strong>Tout est perdu (~75&#8239;%)</strong>&#8239;: le point le plus bas, souvent un écho de mort. <em>Simba seul, hanté par la mort de son père.</em></li>
  <li><strong>La nuit noire de l'âme (75-80&#8239;%)</strong>&#8239;: le héros touche le fond, puis entrevoit la vérité. <em>Rafiki et le fantôme de Mufasa&#8239;: «&#8239;Souviens-toi qui tu es.&#8239;»</em></li>
  <li><strong>Passage au troisième acte (~80&#8239;%)</strong>&#8239;: fort de sa leçon, il repart au combat. <em>Simba décide de rentrer affronter Scar.</em></li>
  <li><strong>Finale (80-100&#8239;%)</strong>&#8239;: il applique ce qu'il a appris et l'emporte. <em>Le combat, la vérité sur Scar révélée, Simba reprend sa place.</em></li>
  <li><strong>Image finale (~100&#8239;%)</strong>&#8239;: le miroir de l'ouverture, qui mesure le chemin parcouru. <em>Un nouveau lever du soleil, la présentation du lionceau&#8239;: le cycle recommence.</em></li>
</ol>
<figure class="blog-figure">
  <img src="/blog/save-the-cat-frise.png" alt="La frise Save the Cat dans Atlas Narratif&#8239;: les 15 beats placés sur les chapitres, répartis sur les trois actes, avec leur position idéale." loading="lazy" />
  <figcaption>Les 15 beats posés sur une vraie histoire, chapitre par chapitre (démo&#8239;: Le Seigneur des Anneaux).</figcaption>
</figure>

<h2>🧩 Comment poser tes 15 beats (le beat sheet)</h2>
<p>La méthode s'utilise comme une check-list. Voici l'ordre de travail le plus efficace&#8239;:</p>
<ol>
  <li><strong>Place d'abord les 5 piliers</strong>&#8239;: catalyseur, midpoint, tout est perdu, passage au troisième acte, image finale. Ce sont eux qui tiennent la structure.</li>
  <li><strong>Vérifie les pourcentages</strong>&#8239;: un catalyseur qui arrive à 30&#8239;% du roman, c'est une mise en place trop longue. Le midpoint doit tomber au milieu, pas aux deux tiers.</li>
  <li><strong>Remplis les respirations</strong>&#8239;: fun and games, débat, nuit noire de l'âme. Ce sont elles qui donnent le rythme entre les coups.</li>
  <li><strong>Relie chaque beat à un chapitre</strong>&#8239;: un beat sans scène, c'est un trou dans ta structure, ou une question à te poser.</li>
</ol>
<p>C'est exactement ce que fait la vue Save the Cat d'<strong>Atlas Narratif</strong>&#8239;: tu poses chaque beat sur tes chapitres et tu vois d'un coup d'œil ceux qui sont en place, ceux qui dérivent, et ceux qui manquent.</p>

<h2>⚠️ Les pièges à éviter</h2>
<ul>
  <li><strong>Le midpoint mou.</strong> Si rien ne bascule au milieu, toute la seconde moitié s'affaisse. Le point médian doit changer la donne, pas meubler.</li>
  <li><strong>La mise en place interminable.</strong> Si ton catalyseur n'arrive qu'au chapitre 8, ton lecteur est déjà parti. Vise les 10&#8239;%.</li>
  <li><strong>Le thème oublié.</strong> Le beat «&#8239;thème énoncé&#8239;» n'est pas décoratif&#8239;: c'est la question morale que le finale doit refermer.</li>
  <li><strong>Appliquer les 15 beats à la lettre.</strong> C'est une carte, pas un moule. Certains beats fusionnent, d'autres se déplacent. L'esprit compte plus que le centimètre.</li>
</ul>

<h2>🧭 Save the Cat, trois actes ou Voyage du Héros&#8239;?</h2>
<p>Save the Cat brille sur les récits à intrigue serrée et rythme soutenu&#8239;: thrillers, comédies, romances, drames. Pour un récit d'initiation ou de quête, le Voyage du Héros est souvent plus parlant. Et rien ne t'empêche de combiner les deux. On compare les trois méthodes dans notre guide <a href="/blog/comment-structurer-un-roman">Comment structurer un roman</a>.</p>

<h2>✅ En résumé</h2>
<p>Save the Cat, c'est 15 repères pour ne jamais écrire dans le brouillard&#8239;: tu sais où tu vas, et surtout où placer chaque temps fort. Commence par les 5 piliers, surveille tes pourcentages, et relie chaque beat à une vraie scène.</p>
<p><strong>Atlas Narratif</strong> intègre les 15 beats, guidés et illustrés, et te montre en un coup d'œil si ta structure tient. L'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Pose tes 15 beats gratuitement avec Atlas Narratif.</a> Guidé, illustré, sans clé API.</p>
`,
};

const heroCircleDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 400" role="img" aria-label="Le cercle du Voyage du Héros : douze étapes réparties en trois phases (Départ, Initiation, Retour), le monde ordinaire en haut, le monde extraordinaire en bas." style="width:100%;height:auto">
    <g font-family="ui-monospace,Menlo,monospace" fill="#a9a291" font-size="12" text-anchor="middle">
      <text x="360" y="24">MONDE ORDINAIRE</text>
      <text x="360" y="330">MONDE EXTRAORDINAIRE</text>
    </g>
    <line x1="210" y1="187" x2="510" y2="187" stroke="#ffffff" stroke-opacity="0.16" stroke-dasharray="4 5"/>
    <circle cx="360" cy="187" r="120" fill="none" stroke="#ffffff" stroke-opacity="0.12"/>
    <g font-family="'Spectral',Georgia,serif" fill="#0b1621" font-size="14" font-weight="600" text-anchor="middle">
      <g><circle cx="360" cy="67"  r="14" fill="#cba15e"/><text x="360" y="72">1</text></g>
      <g><circle cx="420" cy="83"  r="14" fill="#cba15e"/><text x="420" y="88">2</text></g>
      <g><circle cx="464" cy="127" r="14" fill="#cba15e"/><text x="464" y="132">3</text></g>
      <g><circle cx="480" cy="187" r="14" fill="#cba15e"/><text x="480" y="192">4</text></g>
      <g><circle cx="464" cy="247" r="14" fill="#cba15e"/><text x="464" y="252">5</text></g>
      <g><circle cx="420" cy="291" r="14" fill="#5cae8e"/><text x="420" y="296">6</text></g>
      <g><circle cx="360" cy="307" r="14" fill="#5cae8e"/><text x="360" y="312">7</text></g>
      <g><circle cx="300" cy="291" r="14" fill="#5cae8e"/><text x="300" y="296">8</text></g>
      <g><circle cx="256" cy="247" r="14" fill="#5cae8e"/><text x="256" y="252">9</text></g>
      <g><circle cx="240" cy="187" r="14" fill="#d9b98a"/><text x="240" y="192">10</text></g>
      <g><circle cx="256" cy="127" r="14" fill="#d9b98a"/><text x="256" y="132">11</text></g>
      <g><circle cx="300" cy="83"  r="14" fill="#d9b98a"/><text x="300" y="88">12</text></g>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="12" text-anchor="middle">
      <g><rect x="120" y="360" width="12" height="12" rx="3" fill="#cba15e"/><text x="176" y="370" fill="#a9a291">Départ (1-5)</text></g>
      <g><rect x="300" y="360" width="12" height="12" rx="3" fill="#5cae8e"/><text x="360" y="370" fill="#a9a291">Initiation (6-9)</text></g>
      <g><rect x="486" y="360" width="12" height="12" rx="3" fill="#d9b98a"/><text x="540" y="370" fill="#a9a291">Retour (10-12)</text></g>
    </g>
  </svg>
  <figcaption>Le cercle du monomythe&#8239;: le héros quitte le monde ordinaire (en haut), traverse l'épreuve dans le monde extraordinaire (en bas), puis revient transformé.</figcaption>
</figure>`;

const voyageDuHeros = {
  slug: 'voyage-du-heros-12-etapes',
  pillar: 'P1',
  metaTitle: 'Le Voyage du Héros : les 12 étapes expliquées',
  title: 'Le Voyage du Héros : les 12 étapes pour structurer ton récit',
  description:
    'Les 12 étapes du Voyage du Héros de Campbell, expliquées et illustrées par Star Wars, Le Seigneur des Anneaux et Harry Potter, pour structurer ton roman.',
  excerpt:
    'Du monde ordinaire au retour avec l\'élixir : les 12 étapes du monomythe, illustrées par les sagas que tu connais, pour bâtir un vrai arc de héros.',
  date: '2026-09-25',
  readingTime: '9 min',
  tags: ['Voyage du Héros', 'Méthode', 'Structure', 'Campbell'],
  emoji: '🗺️',
  html: `
<p>Il y a une raison pour laquelle <em>Star Wars</em>, <em>Le Seigneur des Anneaux</em> et <em>Harry Potter</em> te donnent la même sensation profonde, malgré des univers que tout oppose. Sous l'histoire, il y a la même charpente&#8239;: le Voyage du Héros. Un jeune homme ordinaire quitte son monde, affronte une épreuve qui le dépasse, et revient changé.</p>
<p>Ce schéma n'a rien d'un gadget de scénariste. C'est un motif que l'humanité se raconte depuis les premiers mythes. Voici ses 12 étapes, une par une, et comment t'en servir pour donner à ton récit un arc qui résonne, sans te transformer en photocopieuse de <em>Star Wars</em>.</p>

<h2>🌱 Pourquoi ce schéma parle à tout le monde</h2>
<p>Dans les années 1940, le mythologue Joseph Campbell compare les récits fondateurs de dizaines de cultures. Sa découverte&#8239;: partout, la même trame revient. Il l'appelle le <strong>monomythe</strong>. Des décennies plus tard, le consultant Christopher Vogler le traduit pour Hollywood en un schéma pratique&#8239;: le Voyage du Héros en 12 étapes.</p>
<p>Pourquoi ça marche&#8239;? Parce que ce voyage n'est pas géographique, il est <strong>intérieur</strong>. Franchir un seuil, affronter sa peur, renaître transformé&#8239;: c'est le récit de toute croissance humaine. Ton lecteur ne suit pas seulement un héros qui traverse un monde&#8239;; il revit, en secret, ses propres passages. C'est ça, le carburant de l'émotion.</p>
<p>Une précision utile&#8239;: le Voyage du Héros n'est pas un moule à remplir case par case. C'est une <strong>carte des passages obligés</strong> d'un récit d'initiation. Tu peux en sauter, en fusionner, en réordonner. L'esprit compte plus que la lettre.</p>

<h2>🚪 Les trois grandes phases</h2>
<p>Avant les 12 étapes, retiens les <strong>trois mouvements</strong> qui les regroupent. Si tu ne retiens que ça, tu tiens déjà l'essentiel.</p>
${heroCircleDiagram}
<ul>
  <li><strong>Le Départ.</strong> Le héros quitte son monde ordinaire. C'est l'appel, le refus, la rencontre du mentor, puis le grand saut dans l'inconnu.</li>
  <li><strong>L'Initiation.</strong> Le cœur du récit. Le héros apprend les règles d'un monde plus grand que lui, encaisse, et affronte l'épreuve suprême.</li>
  <li><strong>Le Retour.</strong> Transformé, il rentre. Mais on ne revient jamais indemne&#8239;: il rapporte un savoir, un pouvoir, un remède pour les siens.</li>
</ul>
<p>Remarque la ligne au milieu du cercle&#8239;: elle sépare le <strong>monde ordinaire</strong> (en haut) du <strong>monde extraordinaire</strong> (en bas). Le héros la franchit deux fois&#8239;: à l'aller, quand il plonge dans l'aventure, et au retour, quand il remonte à la surface, différent.</p>

<h2>🧭 Les 12 étapes, une par une</h2>
<p>On déroule chaque étape avec un exemple que tu connais par cœur, Luke Skywalker dans <em>Star Wars, épisode IV</em>, complété par Frodon et Harry quand ils éclairent mieux le propos.</p>

<h3>Phase 1&#8239;: le Départ</h3>
<ol>
  <li><strong>Le monde ordinaire.</strong> On découvre le héros dans sa vie d'avant, avec ce qui lui manque. <em>Luke s'ennuie ferme sur la ferme de son oncle&#8239;; il rêve d'ailleurs. Frodon coule des jours paisibles dans la Comté.</em></li>
  <li><strong>L'appel à l'aventure.</strong> Un événement vient rompre la routine et propose une mission. <em>Le message de la princesse Leia caché dans R2-D2. Pour Frodon, l'Anneau et la menace qui pèse sur lui.</em></li>
  <li><strong>Le refus de l'appel.</strong> Le héros hésite, a peur, invoque de bonnes raisons de rester. Cette résistance le rend humain. <em>Luke&#8239;: «&#8239;Je ne peux pas partir, mon oncle a besoin de moi pour les récoltes.&#8239;»</em></li>
  <li><strong>La rencontre du mentor.</strong> Une figure d'expérience lui donne un savoir, un objet, un cap. <em>Obi-Wan Kenobi et le sabre laser. Gandalf pour Frodon, Dumbledore pour Harry&#8239;: le mentor est partout.</em></li>
  <li><strong>Le passage du seuil.</strong> Le héros s'engage vraiment et quitte le monde connu. Il n'y a plus de retour en arrière. <em>Luke découvre sa famille assassinée&#8239;: plus rien ne le retient, il part pour Alderaan.</em></li>
</ol>

<h3>Phase 2&#8239;: l'Initiation</h3>
<ol start="6">
  <li><strong>Épreuves, alliés et ennemis.</strong> Dans ce monde nouveau, le héros apprend les règles, se fait des alliés, se heurte à des ennemis. <em>La cantina de Mos Eisley, Han Solo et Chewbacca, l'apprentissage de la Force.</em></li>
  <li><strong>L'approche de la caverne.</strong> On se prépare au vrai danger. La tension monte, les plans se dessinent. <em>Le vaisseau est happé par l'Étoile de la Mort&#8239;: le repaire de l'ennemi.</em></li>
  <li><strong>L'épreuve suprême.</strong> Le face-à-face avec la mort, réelle ou symbolique. Le héros touche le fond. <em>Le compacteur d'ordures, la mort d'Obi-Wan sous les yeux de Luke.</em></li>
  <li><strong>La récompense.</strong> Survivant à l'épreuve, il en sort avec un butin&#8239;: un objet, un savoir, une confiance neuve. <em>La princesse est libérée, les plans de l'Étoile sont entre de bonnes mains.</em></li>
</ol>

<h3>Phase 3&#8239;: le Retour</h3>
<ol start="10">
  <li><strong>Le chemin du retour.</strong> Le héros s'engage vers le dénouement, mais les conséquences le rattrapent&#8239;: l'ennemi n'a pas dit son dernier mot. <em>Les chasseurs impériaux prennent en chasse le Faucon&#8239;; la base rebelle est menacée.</em></li>
  <li><strong>La résurrection.</strong> L'épreuve finale, la plus haute. Le héros mobilise tout ce qu'il a appris et renaît une dernière fois. <em>L'assaut sur l'Étoile&#8239;: Luke coupe son ordinateur de visée et se fie à la Force. Il n'est plus le fermier du début.</em></li>
  <li><strong>Le retour avec l'élixir.</strong> Il revient dans son monde, porteur d'un don pour les siens. <em>La médaille, la victoire de la Rébellion. Frodon rentre dans la Comté, à jamais changé par ce qu'il a porté.</em></li>
</ol>

<h2>⚔️ Le vrai sujet&#8239;: la transformation intérieure</h2>
<p>Voici l'erreur la plus commune&#8239;: croire que le Voyage du Héros parle d'action. Les dragons, les batailles, les vaisseaux&#8239;: ce n'est que la surface. Le vrai sujet, c'est <strong>l'arc intérieur</strong>.</p>
<p>À chaque étape extérieure correspond un mouvement intime. L'appel réveille un manque. Le refus révèle une peur. L'épreuve suprême force le héros à abandonner sa vieille identité. La résurrection le fait renaître autre. Le Luke qui tire le missile n'est plus celui qui se plaignait des récoltes.</p>
<p>Pose-toi donc la question qui compte&#8239;: <em>de quoi mon héros a-t-il peur au début, et qu'a-t-il compris à la fin&#8239;?</em> Si tu ne peux pas répondre, ton voyage n'est encore qu'un itinéraire. Compare toujours le point de départ intérieur et le point d'arrivée&#8239;: c'est l'écart entre les deux qui bouleverse le lecteur.</p>

<h2>🗺️ Le Voyage du Héros à l'échelle d'une saga</h2>
<p>Sur un roman unique, les 12 étapes cadrent l'ensemble. Sur une <strong>saga</strong>, ça se joue à deux niveaux à la fois, et c'est là que beaucoup d'auteurs se perdent.</p>
<ul>
  <li><strong>Le grand arc</strong> couvre toute la série&#8239;: Frodon quitte la Comté au début de <em>La Communauté de l'Anneau</em> et revient transformé à la fin du <em>Retour du Roi</em>. Un seul immense Voyage, étalé sur trois tomes.</li>
  <li><strong>Les arcs de tome</strong> rejouent, en miniature, leur propre cycle. Chaque volume a son appel, son épreuve, sa récompense partielle, sinon il devient un simple couloir entre deux moments forts.</li>
</ul>
<p>Autre subtilité de la saga&#8239;: tu peux faire vivre un Voyage à <strong>plusieurs personnages en parallèle</strong>. Dans <em>Le Seigneur des Anneaux</em>, Frodon, Aragorn et Sam suivent chacun leur propre courbe. Les tenir toutes de tête, en s'assurant qu'aucune ne s'affaisse, devient vite impossible sans une vue d'ensemble. C'est exactement ce que la vue <strong>Voyage du Héros</strong> d'Atlas Narratif permet&#8239;: suivre l'arc de chaque personnage, étape par étape, et repérer celui qui piétine.</p>
<figure class="blog-figure">
  <img src="/blog/voyage-du-heros.png" alt="La vue Voyage du Héros dans Atlas Narratif&#8239;: les 12 étapes de l'arc d'Aragorn réparties en trois phases (Départ, Initiation, Retour), chacune reliée à un chapitre." loading="lazy" />
  <figcaption>Les 12 étapes du Voyage du Héros appliquées à l'arc d'Aragorn (démo LOTR).</figcaption>
</figure>

<h2>⚠️ Les erreurs classiques à éviter</h2>
<ul>
  <li><strong>Suivre le schéma à la lettre.</strong> Cocher les 12 cases dans l'ordre produit un récit mécanique et prévisible. Sers-toi de la carte, ne deviens pas son esclave.</li>
  <li><strong>Oublier le refus de l'appel.</strong> Un héros qui fonce sans hésiter n'a pas d'enjeu intérieur. La résistance du début rend la suite crédible.</li>
  <li><strong>Un mentor qui reste trop longtemps.</strong> Si le mentor résout les problèmes à la place du héros, ce dernier ne grandit pas. Le mentor prépare, puis s'efface&#8239;: ce n'est pas un hasard si Obi-Wan meurt aux deux tiers du film.</li>
  <li><strong>Une épreuve suprême sans vrai risque.</strong> Si le héros ne perd rien et ne risque rien, il n'y a pas de renaissance possible. L'épreuve doit lui coûter.</li>
  <li><strong>Un retour bâclé.</strong> Beaucoup de récits s'arrêtent à la victoire et oublient le retour. Or c'est là que le sens se dépose&#8239;: qu'est-ce que le héros rapporte&#8239;?</li>
</ul>

<h2>🪜 Méthode pas-à-pas&#8239;: appliquer le Voyage à ton récit</h2>
<ol>
  <li><strong>Nomme le manque de départ.</strong> Qu'est-ce qui cloche dans la vie ordinaire de ton héros&#8239;? Sa transformation partira de là.</li>
  <li><strong>Définis l'arc intérieur.</strong> Écris en une phrase ce qu'il croit au début et ce qu'il comprendra à la fin. C'est ta boussole.</li>
  <li><strong>Place les quatre bornes.</strong> Appel, passage du seuil, épreuve suprême, retour avec l'élixir. Ce sont les piliers&#8239;; le reste se logera entre.</li>
  <li><strong>Fais du monde extraordinaire un vrai contraste.</strong> Plus il diffère du monde ordinaire, plus le voyage a de relief.</li>
  <li><strong>Vérifie chaque étape par sa fonction, pas par son étiquette.</strong> Peu importe le nom&#8239;: demande-toi ce que la scène fait avancer chez le héros.</li>
  <li><strong>Prends de la hauteur.</strong> Une fois les étapes posées, visualise l'arc en entier pour repérer le ventre mou. C'est en voyant le voyage d'un bloc qu'on sent ce qui manque.</li>
</ol>

<h2>✅ En résumé</h2>
<p>Le Voyage du Héros n'est pas une recette, c'est la carte des grandes transformations. Trois mouvements&#8239;: partir, être mis à l'épreuve, revenir changé. Douze étapes pour baliser le chemin. Et un seul vrai sujet sous la surface&#8239;: l'arc intérieur de ton héros. Sers-t'en comme d'une boussole, jamais comme d'un gabarit.</p>
<p>Pour aller plus loin, compare-le aux autres méthodes dans notre guide <a href="/blog/comment-structurer-un-roman">Comment structurer un roman</a>, ou découvre la mécanique de rythme la plus précise avec <a href="/blog/la-methode-save-the-cat-15-beats">la méthode Save the Cat</a>.</p>
<p><strong>Atlas Narratif</strong> intègre le Voyage du Héros, guidé et illustré par des œuvres connues, pour poser les 12 étapes de chacun de tes personnages et suivre leur transformation d'un tome à l'autre. Tes textes restent les tiens, chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Trace le Voyage de ton héros gratuitement avec Atlas Narratif.</a> Guidé, illustré, pensé pour les sagas.</p>
`,
};

const timelineDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 300" role="img" aria-label="Deux frises comparées : l'ordre du récit (tes chapitres) en haut, l'ordre chronologique des événements en bas, avec un chapitre raconté en flash-back." style="width:100%;height:auto">
    <g font-family="ui-monospace,Menlo,monospace" font-size="12" fill="#a9a291">
      <text x="40" y="44">ORDRE DU RÉCIT (tes chapitres)</text>
      <text x="40" y="214">ORDRE CHRONOLOGIQUE (ce qui s'est passé)</text>
    </g>
    <line x1="60" y1="90" x2="660" y2="90" stroke="#5cae8e" stroke-opacity="0.5" stroke-width="2"/>
    <line x1="60" y1="240" x2="660" y2="240" stroke="#5cae8e" stroke-opacity="0.5" stroke-width="2"/>
    <path d="M420 90 C 300 140, 180 190, 60 240" fill="none" stroke="#cba15e" stroke-width="2" stroke-dasharray="5 5"/>
    <g font-family="'Spectral',Georgia,serif" fill="#0b1621" font-size="13" font-weight="600" text-anchor="middle">
      <g><circle cx="60"  cy="90" r="15" fill="#5cae8e"/><text x="60"  y="95">1</text></g>
      <g><circle cx="180" cy="90" r="15" fill="#5cae8e"/><text x="180" y="95">2</text></g>
      <g><circle cx="300" cy="90" r="15" fill="#5cae8e"/><text x="300" y="95">3</text></g>
      <g><circle cx="420" cy="90" r="15" fill="#cba15e"/><text x="420" y="95">4</text></g>
      <g><circle cx="540" cy="90" r="15" fill="#5cae8e"/><text x="540" y="95">5</text></g>
      <g><circle cx="660" cy="90" r="15" fill="#5cae8e"/><text x="660" y="95">6</text></g>
      <g><circle cx="60"  cy="240" r="15" fill="#cba15e"/><text x="60"  y="245">4</text></g>
      <g><circle cx="180" cy="240" r="15" fill="#5cae8e"/><text x="180" y="245">1</text></g>
      <g><circle cx="300" cy="240" r="15" fill="#5cae8e"/><text x="300" y="245">2</text></g>
      <g><circle cx="420" cy="240" r="15" fill="#5cae8e"/><text x="420" y="245">3</text></g>
      <g><circle cx="540" cy="240" r="15" fill="#5cae8e"/><text x="540" y="245">5</text></g>
      <g><circle cx="660" cy="240" r="15" fill="#5cae8e"/><text x="660" y="245">6</text></g>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11.5" fill="#a9a291">
      <rect x="60" y="276" width="12" height="12" rx="3" fill="#cba15e"/>
      <text x="82" y="286">Le chapitre 4 est un flash-back&#8239;: raconté tard, il s'est passé en premier.</text>
    </g>
  </svg>
  <figcaption>Le même récit, deux lectures&#8239;: l'ordre où tu racontes (en haut) n'est pas l'ordre où les choses arrivent (en bas).</figcaption>
</figure>`;

const creerTimeline = {
  slug: 'creer-une-timeline-roman',
  pillar: 'P1',
  metaTitle: 'Créer une timeline pour ton roman : méthode + outils',
  title: 'Créer une timeline pour ton roman : méthode et outils',
  description:
    'Comment créer une timeline de roman claire : chronologie contre ordre des chapitres, méthode pas-à-pas et outils pour garder le fil de ta saga.',
  excerpt:
    'Chronologie ou ordre des chapitres ? La méthode pour bâtir une timeline qui tient, repérer les trous et garder le fil d\'une saga entière.',
  date: '2026-09-29',
  readingTime: '8 min',
  tags: ['Timeline', 'Chronologie', 'Méthode', 'Saga'],
  emoji: '⏳',
  html: `
<p>Tu écris une scène où ton héros a 17 ans. Trois chapitres plus loin, tu évoques un souvenir «&#8239;d'il y a cinq ans&#8239;»&#8239;: il en avait donc 12. Mais au chapitre 2, tu as écrit qu'à cette époque il vivait déjà seul. Tient-il debout, ce puzzle&#8239;? Sans une timeline, impossible d'en être sûr.</p>
<p>Une frise chronologique, ce n'est pas un luxe de maniaque. C'est l'outil qui t'évite les trous de continuité, les tunnels sans tension et les incohérences qui sautent aux yeux du lecteur. Voici comment en construire une qui tienne, du roman unique à la saga en plusieurs tomes.</p>

<h2>⏳ Une timeline, pour quoi faire</h2>
<p>Écrire, c'est tenir des centaines de fils en même temps&#8239;: qui sait quoi, qui est où, quand, depuis combien de temps. Ta mémoire lâche bien avant ton ambition. La timeline décharge ta tête et te sert trois choses concrètes&#8239;:</p>
<ul>
  <li><strong>Traquer les incohérences.</strong> Un personnage à deux endroits le même jour, un enfant qui vieillit de travers, un événement impossible dans ta chronologie&#8239;: la frise les fait ressortir d'un coup d'œil.</li>
  <li><strong>Doser le rythme.</strong> Vue d'ensemble, tu repères les tunnels où rien ne se passe et les moments où tu tasses trop d'action. La tension se pilote à hauteur de frise.</li>
  <li><strong>Retrouver le fil.</strong> Tu reprends ton manuscrit après trois semaines&#8239;? La timeline te remet en selle en trente secondes, au lieu de relire cent pages.</li>
</ul>

<h2>🔀 Chronologie contre ordre des chapitres</h2>
<p>Voici la distinction qui change tout, et que beaucoup d'auteurs confondent. Il existe <strong>deux temps</strong> dans un roman&#8239;:</p>
<ul>
  <li><strong>L'ordre du récit</strong>&#8239;: l'ordre dans lequel tu <em>racontes</em> les choses, chapitre après chapitre.</li>
  <li><strong>L'ordre chronologique</strong>&#8239;: l'ordre dans lequel les choses <em>arrivent</em> réellement dans le monde de l'histoire.</li>
</ul>
<p>Tant que tu racontes tout dans l'ordre, les deux se confondent. Mais dès que tu glisses un flash-back, un prologue situé dans le passé, ou des lignes temporelles parallèles, ils divergent, et c'est là que naissent les erreurs.</p>
${timelineDiagram}
<p>Une bonne timeline te laisse <strong>voir les deux à la fois</strong>. Tu vérifies la cohérence sur l'axe chronologique, et tu pilotes le suspense sur l'axe du récit. Les maîtres du thriller jouent en permanence de l'écart entre ces deux ordres&#8239;: ils te cachent, dans le passé, ce qu'ils révéleront au bon moment.</p>

<h2>🧱 Ce qu'une bonne timeline doit contenir</h2>
<p>Une frise utile ne se limite pas à une liste de dates. Pour chaque événement marquant, garde une trace de&#8239;:</p>
<ul>
  <li><strong>Quand</strong>&#8239;: la date ou le repère temporel (jour 3, an 1247, «&#8239;dix ans avant&#8239;»). Même un temps relatif vaut mieux que rien.</li>
  <li><strong>Où</strong>&#8239;: le lieu, surtout si tes personnages se déplacent beaucoup.</li>
  <li><strong>Qui</strong>&#8239;: les personnages présents, et ce qu'ils apprennent à ce moment. Le fameux «&#8239;qui sait quoi, quand&#8239;» est la clé des révélations.</li>
  <li><strong>Le chapitre</strong>&#8239;: où l'événement est raconté, pour relier l'ordre chronologique à l'ordre du récit.</li>
  <li><strong>L'enjeu</strong>&#8239;: en une ligne, ce que la scène fait avancer. Un événement sans conséquence est un candidat à la coupe.</li>
</ul>

<h2>🪜 Créer ta timeline pas-à-pas</h2>
<ol>
  <li><strong>Liste les événements majeurs.</strong> Ne cherche pas l'exhaustivité tout de suite&#8239;: pose d'abord les grands jalons, ceux dont dépend l'intrigue.</li>
  <li><strong>Range-les dans l'ordre chronologique.</strong> Pas l'ordre des chapitres&#8239;: l'ordre réel des faits, y compris ce qui précède le début du roman.</li>
  <li><strong>Ancre un repère temporel à chacun.</strong> Absolu (une date) ou relatif («&#8239;trois jours plus tard&#8239;»). L'important est que les écarts soient cohérents entre eux.</li>
  <li><strong>Relie chaque événement à son chapitre.</strong> C'est ce lien qui révèle tes flash-backs et tes sauts dans le temps.</li>
  <li><strong>Chasse les collisions.</strong> Deux scènes au même endroit au même moment&#8239;? Un personnage qui devine ce qu'il n'a pas encore appris&#8239;? La frise les met à nu.</li>
  <li><strong>Recule et regarde le rythme.</strong> Des mois sans rien, puis tout en trois jours&#8239;? Vue d'ensemble, tu ajustes la cadence avant que le lecteur ne décroche.</li>
</ol>

<h2>🗺️ La timeline d'une saga multi-tomes</h2>
<p>Sur un roman, une frise suffit. Sur une <strong>saga</strong>, la timeline devient vitale, parce que les erreurs se nichent entre les tomes, là où ta mémoire a le plus de mal.</p>
<ul>
  <li><strong>Les âges qui dérivent.</strong> Cinq ans passent entre le tome 1 et le tome 3&#8239;? Tous tes personnages ont vieilli d'autant. Sans frise, un enfant reste figé pendant que le monde avance.</li>
  <li><strong>Les amorces à distance.</strong> Une promesse semée au tome 1 se paie parfois deux tomes plus loin. La timeline te rappelle quand tu l'as posée, et quand elle doit exploser.</li>
  <li><strong>Les intrigues parallèles.</strong> Quand plusieurs groupes de personnages avancent en même temps dans des lieux différents, il faut que leurs horloges restent synchrones. Une bataille ne peut pas durer trois jours pour l'un et une semaine pour l'autre.</li>
</ul>
<p>Tenir tout ça sur un seul document devient vite ingérable. C'est précisément pour les séries qu'une <strong>timeline outillée</strong> prend son sens&#8239;: filtrer par tome, par personnage, relier chaque événement à son chapitre et à la carte. Atlas Narratif a été pensé pour ça, et va plus loin&#8239;: il croise ta chronologie avec tes lieux et tes personnages pour repérer les incohérences avant tes lecteurs. On détaille ce point dans notre guide sur <a href="/blog/comment-structurer-un-roman">comment structurer un roman</a>.</p>

<h2>⚠️ Les erreurs classiques à éviter</h2>
<ul>
  <li><strong>Confondre les deux ordres.</strong> Ranger ta timeline dans l'ordre des chapitres t'aveugle sur les incohérences chronologiques. Sépare toujours ce qui arrive de ce qui se raconte.</li>
  <li><strong>Le flou temporel.</strong> Enchaîner les «&#8239;quelque temps plus tard&#8239;» sans jamais fixer d'ancrage finit par embrouiller le lecteur, et toi le premier.</li>
  <li><strong>Oublier le hors-champ.</strong> Ce qui s'est passé avant le premier chapitre compte aussi. Les motivations de tes personnages y sont enracinées.</li>
  <li><strong>Une timeline figée dans le marbre.</strong> Ton histoire évolue&#8239;; ta frise doit suivre. Une timeline jamais mise à jour ment plus qu'elle n'aide.</li>
</ul>

<h2>🛠️ Papier, tableur ou outil dédié</h2>
<p>Il n'y a pas de honte à commencer simple. Le bon outil, c'est celui que tu tiens dans la durée.</p>
<ul>
  <li><strong>Le papier ou les post-it.</strong> Parfaits pour dégrossir, très visuels. Leur limite&#8239;: ils ne filtrent rien et se figent vite. Difficile d'y suivre une saga de cinq tomes.</li>
  <li><strong>Le tableur.</strong> Souple, gratuit, il encaisse beaucoup. Mais tu construis tout à la main, et une colonne de dates ne <em>montre</em> pas le rythme&#8239;: il faut le déduire.</li>
  <li><strong>L'outil dédié.</strong> Il visualise la frise, filtre par tome ou par personnage, relie les événements aux chapitres et à la carte, et surtout repère les collisions à ta place. C'est le gain décisif dès que l'histoire grossit.</li>
</ul>
<p>La vue <strong>timeline</strong> d'Atlas Narratif fait exactement ça&#8239;: tu poses tes événements chapitre par chapitre, tu les filtres par tome, et tu vois l'arc émotionnel se dessiner par-dessus. Le tout gratuitement, tes textes chiffrés et sans aucun tracking.</p>
<figure class="blog-figure">
  <img src="/blog/timeline-roman.png" alt="La vue timeline d'Atlas Narratif&#8239;: les chapitres en colonnes, chacun avec ses événements, ses personnages et son POV, et un onglet pour basculer en ordre chronologique." loading="lazy" />
  <figcaption>La timeline chapitre par chapitre, et l'onglet «&#8239;chrono&#8239;» pour passer à l'ordre chronologique (démo LOTR).</figcaption>
</figure>

<h2>✅ En résumé</h2>
<p>Une timeline, c'est ta mémoire externe d'auteur. Retiens l'essentiel&#8239;: distingue toujours l'ordre où les choses <em>arrivent</em> de l'ordre où tu les <em>racontes</em>, ancre tes événements dans le temps, relie-les à tes chapitres, et prends de la hauteur pour piloter le rythme. Sur une saga, ce n'est plus une option.</p>
<p><strong>Atlas Narratif</strong> te donne une timeline claire, filtrable par tome et par personnage, croisée avec ta carte et tes incohérences. L'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Construis la timeline de ton roman gratuitement avec Atlas Narratif.</a> Et si tu as déjà un manuscrit, importe-le pour en obtenir la frise en quelques minutes.</p>
`,
};

const nanoPaceDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 300" role="img" aria-label="Deux courbes sur 30 jours : l'objectif régulier de 1667 mots par jour, et la réalité qui plonge au 'mur de la semaine 2' avant de remonter." style="width:100%;height:auto">
    <g font-family="ui-monospace,Menlo,monospace" font-size="12" fill="#a9a291">
      <text x="20" y="30">50 000 MOTS</text>
      <text x="20" y="250">JOUR 1</text>
      <text x="628" y="250">JOUR 30</text>
    </g>
    <line x1="60" y1="220" x2="680" y2="220" stroke="#ffffff" stroke-opacity="0.14"/>
    <line x1="60" y1="40" x2="60" y2="220" stroke="#ffffff" stroke-opacity="0.14"/>
    <polyline fill="none" stroke="#cba15e" stroke-width="2.5" stroke-dasharray="6 5" points="60,220 680,50"/>
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="60,220 130,196 200,172 270,162 320,176 360,182 400,160 470,120 540,96 610,70 680,50"/>
    <circle cx="340" cy="180" r="4.5" fill="#cba15e"/>
    <g font-family="'Spectral',Georgia,serif" fill="#a9a291" font-size="12.5" text-anchor="middle">
      <text x="340" y="205">le mur de la semaine 2</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11.5">
      <rect x="470" y="264" width="12" height="12" rx="3" fill="#cba15e"/>
      <text x="492" y="274" fill="#a9a291">objectif</text>
      <rect x="560" y="264" width="12" height="12" rx="3" fill="#5cae8e"/>
      <text x="582" y="274" fill="#a9a291">réalité</text>
    </g>
  </svg>
  <figcaption>1667 mots par jour en théorie&#8239;; en pratique, la motivation plonge vers la semaine 2. Un plan solide, c'est ce qui te fait remonter la pente.</figcaption>
</figure>`;

const planifierRomanNovembre = {
  slug: 'planifier-roman-novembre-methode',
  pillar: 'P1',
  metaTitle: 'Planifier son roman de novembre : la méthode',
  title: 'Planifie ton roman de novembre : la méthode pour tenir 50 000 mots',
  description:
    'Préparer ton roman de novembre avant le 1er : choisir une structure, poser tes beats et ta timeline pour écrire 50 000 mots sans t\'enliser.',
  excerpt:
    'Le secret des auteurs qui finissent leur roman de novembre ? Ils préparent en octobre. Choisis ta structure, pose tes beats, et écris tes 50 000 mots sans t\'enliser.',
  date: '2026-10-02',
  readingTime: '8 min',
  tags: ['Défi d\'écriture', 'Méthode', 'Planification', 'Structure'],
  emoji: '📅',
  html: `
<p>Chaque novembre, des milliers d'auteurs se lancent le même défi&#8239;: écrire 50 000 mots en 30 jours. Longtemps, ce défi s'est appelé NaNoWriMo&#8239;; l'association a fermé en 2025, mais la tradition a survécu, portée par les communautés d'auteurs et des successeurs comme Novel November. Et chaque année, la même statistique tombe&#8239;: la plupart abandonnent avant la fin. Presque toujours au même endroit, autour de la deuxième semaine, quand l'élan retombe et que l'histoire part dans tous les sens.</p>
<p>La différence entre ceux qui franchissent la ligne et les autres tient rarement au talent ou au temps libre. Elle tient à une chose&#8239;: <strong>un plan préparé avant le 1er novembre</strong>. Voici comment t'y prendre.</p>

<h2>📅 Le défi des 50 000 mots en novembre</h2>
<p>Le principe est simple&#8239;: écrire un premier jet de roman, 50 000 mots, entre le 1er et le 30 novembre. Soit environ <strong>1667 mots par jour</strong>, tous les jours, pendant un mois. L'idée n'est pas d'écrire un chef-d'œuvre, mais de <em>finir un jet</em>, en imposant silence à ton éditeur intérieur.</p>
<p>Ce rythme paraît tenable sur le papier. Le piège n'est pas la vitesse d'écriture&#8239;: c'est de savoir <em>quoi</em> écrire chaque jour. C'est là que le plan fait toute la différence.</p>
${nanoPaceDiagram}

<h2>🧭 Planifier ou foncer</h2>
<p>Dans la communauté, deux écoles s'affrontent&#8239;: les <strong>planners</strong> (qui préparent tout) et les <strong>pantsers</strong> (qui écrivent à l'instinct, «&#8239;au feeling&#8239;»). Les deux peuvent relever le défi, mais pour un premier, planifier change radicalement les chances.</p>
<p>Pourquoi&#8239;? Parce que le pantsing t'expose à la panne&#8239;: tu ouvres ton document au jour 12, et tu ne sais pas ce qui se passe ensuite. Chaque jour sans plan, tu paies une «&#8239;taxe de décision&#8239;» avant même d'écrire un mot. Un plan, même léger, supprime cette taxe&#8239;: tu sais quelle scène écrire, tu écris.</p>
<p>D'où la tradition du <strong>«&#8239;Preptober&#8239;»</strong> (le mois d'octobre consacré à la préparation). Pas besoin d'un mois entier&#8239;: une semaine de prep bien menée suffit largement.</p>

<h2>🗺️ Ton plan en une semaine</h2>
<p>Voici une prep réaliste, à boucler avant le 1er novembre. Chaque étape prend une soirée, pas plus.</p>
<ol>
  <li><strong>Formule ta prémisse en une phrase.</strong> «&#8239;Un jeune fermier découvre un pouvoir et doit affronter un empire.&#8239;» Si tu ne peux pas la résumer, l'histoire n'est pas prête.</li>
  <li><strong>Choisis une structure.</strong> Save the Cat pour une intrigue rythmée, le Voyage du Héros pour une quête ou une initiation. On les compare dans notre guide <a href="/blog/comment-structurer-un-roman">comment structurer un roman</a>.</li>
  <li><strong>Place tes grandes bornes.</strong> Ouverture, catalyseur, midpoint, tout est perdu, climax. Cinq points, et ta colonne vertébrale tient.</li>
  <li><strong>Esquisse tes personnages.</strong> Le héros, ce qui lui manque, ce qu'il veut. Deux ou trois seconds rôles. Pas une bible complète&#8239;: juste de quoi les faire vivre.</li>
  <li><strong>Découpe en scènes.</strong> Transforme tes beats en une liste de scènes à écrire. C'est ta feuille de route quotidienne&#8239;: chaque jour, tu piques dedans.</li>
</ol>
<p>Avec ça, tu n'ouvres jamais une page blanche&#8239;: tu ouvres une scène qui t'attend.</p>

<h2>🏗️ Poser ta structure, concrètement</h2>
<p>Cette prep, tu peux la faire sur papier ou dans un tableur. Mais un outil qui visualise ta structure te fait gagner un temps précieux&#8239;: tu vois d'un coup d'œil les trous, les temps forts qui manquent, les scènes déjà prêtes.</p>
<p>Dans <strong>Atlas Narratif</strong>, tu choisis ta méthode (Save the Cat ou Voyage du Héros), tu poses tes beats sur tes futurs chapitres, et tu repères aussitôt ceux qui sonnent creux. Ta feuille de route de novembre est là, sous tes yeux, avant même d'avoir écrit la première ligne.</p>
<figure class="blog-figure">
  <img src="/blog/save-the-cat-frise.png" alt="La frise Save the Cat dans Atlas Narratif&#8239;: les beats posés sur les chapitres avant le défi de novembre, prêts à guider l'écriture jour après jour." loading="lazy" />
  <figcaption>Poser ses beats avant le 1er novembre&#8239;: ta feuille de route quotidienne, prête (démo LOTR).</figcaption>
</figure>

<h2>🏃 Tenir les 30 jours</h2>
<p>La prep gagne la moitié de la bataille&#8239;; l'autre moitié, c'est la régularité. Quelques repères pour ne pas lâcher&#8239;:</p>
<ul>
  <li><strong>Écris tous les jours, même mal.</strong> 1667 mots imparfaits valent mieux que 0 mot parfait. Le premier jet a le droit d'être moche.</li>
  <li><strong>Ne te relis pas.</strong> Corriger en cours de route est le meilleur moyen de t'enliser. Tu réviseras en décembre.</li>
  <li><strong>Prends un peu d'avance au début.</strong> L'énergie du jour 1 est un cadeau&#8239;: le coussin de mots que tu te constitues t'amortira le fameux mur de la semaine 2.</li>
  <li><strong>Appuie-toi sur ton plan quand ça coince.</strong> Panne d'inspiration&#8239;? Retourne à ta liste de scènes et écris la suivante. Ta feuille de route est ton filet.</li>
</ul>

<h2>⚠️ Les erreurs classiques</h2>
<ul>
  <li><strong>Partir sans aucun plan.</strong> C'est le billet le plus court vers l'abandon en semaine 2.</li>
  <li><strong>Trop planifier.</strong> À l'inverse, passer octobre à peaufiner une bible de 200 pages, c'est fuir l'écriture. Un plan léger suffit&#8239;: garde du carburant pour novembre.</li>
  <li><strong>Viser la perfection.</strong> Le défi de novembre produit un premier jet, pas un manuscrit fini. Confonds les deux et tu cales dès le chapitre 3.</li>
  <li><strong>Écrire dans le désordre sans repère.</strong> Sauter de scène en scène, c'est permis&#8239;; mais sans timeline, tu perds vite le fil de qui sait quoi et quand.</li>
</ul>

<h2>✅ En résumé</h2>
<p>Le défi de novembre ne se gagne pas au talent, mais à la préparation. Une semaine de prep en octobre&#8239;: une prémisse claire, une structure choisie, cinq bornes posées, tes scènes découpées. Ensuite, tu écris, sans te relire, sans viser la perfection, en t'appuyant sur ton plan les jours difficiles.</p>
<p><strong>Atlas Narratif</strong> est l'atelier idéal pour ta prep&#8239;: pose ta structure (Save the Cat ou Voyage du Héros), visualise ta timeline et tes personnages, et arrive au 1er novembre avec une carte au lieu d'une page blanche. Gratuit, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Prépare ton roman de novembre gratuitement avec Atlas Narratif.</a> Choisis ta méthode, pose tes beats, et lance-toi le 1er novembre avec un plan.</p>
`,
};

const structureLOTR = {
  slug: 'structure-seigneur-des-anneaux',
  pillar: 'P3',
  metaTitle: 'La structure du Seigneur des Anneaux décortiquée',
  title: 'La structure du Seigneur des Anneaux décortiquée',
  description:
    'Save the Cat, Voyage du Héros, amorces et paiements : on décortique la structure narrative du Seigneur des Anneaux, tome par tome, comme un cas d\'école.',
  excerpt:
    'Pourquoi la saga de Tolkien tient-elle si bien debout ? On décortique sa structure : beats, arcs entrelacés, amorces payées trois tomes plus loin.',
  date: '2026-10-06',
  readingTime: '10 min',
  tags: ['Le Seigneur des Anneaux', 'Étude de cas', 'Structure', 'Saga'],
  emoji: '💍',
  html: `
<p>On peut lire <em>Le Seigneur des Anneaux</em> comme un lecteur, emporté par le souffle. On peut aussi l'ouvrir comme un auteur, pour comprendre <em>pourquoi</em> ça marche. Trois tomes, des dizaines de personnages, une géographie entière, des fils semés au premier chapitre et payés mille pages plus loin&#8239;: et pourtant, tout tient.</p>
<p>C'est le cas d'école parfait. Décortiquons la structure de la saga de Tolkien avec les mêmes outils que tu appliquerais à la tienne&#8239;: les beats, les arcs de héros, les amorces et paiements. Tout ce que tu vois ici a été passé dans Atlas Narratif&#8239;: c'est la démo que tu peux explorer toi-même.</p>

<h2>💍 Pourquoi LOTR est un cas d'école</h2>
<p>Une histoire courte pardonne les faiblesses de structure&#8239;: on arrive au bout avant qu'elles ne gênent. Une <strong>saga</strong>, non. Sur trois tomes, la moindre promesse oubliée, le moindre arc qui s'affaisse se paient cash. Que <em>Le Seigneur des Anneaux</em> tienne sur cette distance n'a rien d'un miracle&#8239;: c'est de l'architecture.</p>
<p>Et cette architecture est lisible. Tolkien n'a pas suivi de méthode moderne (elles sont venues après lui), mais son récit épouse ces schémas avec une précision qui en fait le meilleur terrain d'apprentissage qui soit.</p>

<h2>🎬 LOTR vu par Save the Cat</h2>
<p>Prends la trame de <em>La Communauté de l'Anneau</em> et pose-la sur les 15 beats de Save the Cat&#8239;: l'emboîtement est frappant.</p>
<ul>
  <li><strong>Image d'ouverture</strong>&#8239;: la Comté, paisible, hors du temps. Un paradis qu'on apprend à aimer avant de le voir menacé.</li>
  <li><strong>Catalyseur</strong>&#8239;: Gandalf révèle la vérité sur l'Anneau. La routine de Frodon vole en éclats.</li>
  <li><strong>Passage au deuxième acte</strong>&#8239;: Frodon quitte la Comté. Plus de retour possible.</li>
  <li><strong>Midpoint</strong>&#8239;: la Moria, la chute de Gandalf. Une fausse défaite qui soude et endeuille la Communauté.</li>
  <li><strong>Tout est perdu</strong>&#8239;: la Communauté se brise à Amon Hen, Boromir tombe.</li>
  <li><strong>Image finale</strong>&#8239;: Frodon et Sam, seuls, choisissent la route du Mordor. La quête, désormais, sera intime.</li>
</ul>
<p>Chaque tome rejoue ensuite sa propre courbe. C'est la clé des sagas&#8239;: un grand arc d'ensemble, et dans chaque tome un arc complet en miniature.</p>
<figure class="blog-figure">
  <img src="/blog/save-the-cat-frise.png" alt="La frise Save the Cat dans Atlas Narratif&#8239;: les 15 beats du Seigneur des Anneaux placés sur les chapitres, répartis sur les trois actes." loading="lazy" />
  <figcaption>Les 15 beats de Save the Cat posés sur la trilogie, chapitre par chapitre (démo LOTR).</figcaption>
</figure>

<h2>🧭 Les Voyages du Héros entrelacés</h2>
<p>Le vrai tour de force de Tolkien, c'est de faire vivre <strong>plusieurs Voyages du Héros en parallèle</strong>, décalés dans le temps, qui s'éclairent l'un l'autre&#8239;:</p>
<ul>
  <li><strong>Frodon</strong> suit le voyage du porteur du fardeau&#8239;: son épreuve est intérieure, l'Anneau le ronge. Son «&#8239;retour avec l'élixir&#8239;» est doux-amer&#8239;: il sauve la Comté mais ne peut plus y vivre.</li>
  <li><strong>Aragorn</strong> incarne le voyage du roi réticent&#8239;: du rôdeur dans l'ombre au souverain qui assume sa couronne. Un arc d'acceptation de soi.</li>
  <li><strong>Sam</strong>, souvent oublié, accomplit peut-être le plus bel arc&#8239;: le jardinier ordinaire qui se révèle le véritable héros de la quête.</li>
</ul>
<p>Ces trois courbes ne montent pas au même rythme, et c'est voulu&#8239;: quand l'une redescend, une autre s'élève. C'est ce tressage qui tient le lecteur en haleine sur trois tomes.</p>
<figure class="blog-figure">
  <img src="/blog/voyage-du-heros.png" alt="La vue Voyage du Héros dans Atlas Narratif&#8239;: les 12 étapes de l'arc d'Aragorn, du rôdeur au roi, réparties en trois phases." loading="lazy" />
  <figcaption>L'arc d'Aragorn, du rôdeur au roi, en 12 étapes (démo LOTR).</figcaption>
</figure>

<h2>🌱 Les amorces payées trois tomes plus loin</h2>
<p>C'est ici que la maîtrise de Tolkien éclate. Des promesses semées très tôt trouvent leur paiement des centaines de pages plus loin&#8239;:</p>
<ul>
  <li><strong>Narsil, l'épée brisée.</strong> Reforgée en Andúril dès Fondcombe, au tome 1, elle accompagne Aragorn tout au long du voyage&#8239;; mais son plein paiement symbolique n'éclate qu'au tome 3, quand il la brandit pour assumer sa couronne. L'amorce et son paiement encadrent toute la saga.</li>
  <li><strong>La fiole de Galadriel.</strong> Simple cadeau d'adieu au tome 1, elle sauve Frodon et Sam d'Arachne au tome 2. Une promesse discrète, un paiement crucial.</li>
  <li><strong>La pitié envers Gollum.</strong> Frodon épargne Gollum&#8239;; Gandalf lui souffle que ce dernier a peut-être encore un rôle à jouer. Le paiement&#8239;? Sans Gollum, l'Anneau n'aurait jamais été détruit au Mont Destin.</li>
</ul>
<p>Aucune de ces amorces n'est là par hasard. Chacune est une dette narrative que Tolkien contracte tôt et rembourse au moment exact où elle fera le plus d'effet. Tenir ce fil sur trois tomes, de tête, est quasi impossible&#8239;: c'est exactement ce que traque le suivi des amorces et paiements.</p>
<figure class="blog-figure">
  <img src="/blog/amorces-paiements.png" alt="Le suivi des amorces et paiements dans Atlas Narratif&#8239;: chaque promesse du Seigneur des Anneaux reliée du chapitre où elle est posée à celui où elle est résolue." loading="lazy" />
  <figcaption>Chaque amorce reliée à son paiement, d'un tome à l'autre (démo LOTR).</figcaption>
</figure>

<h2>🗺️ La géographie comme structure</h2>
<p>Chez Tolkien, la carte n'est pas un décor&#8239;: c'est une colonne vertébrale. La quête <em>est</em> un déplacement, de la Comté au Mont Destin, et la progression géographique épouse la montée de la tension. Plus on approche du Mordor, plus l'étau se resserre.</p>
<p>Visualiser les trajets de chaque personnage sur une carte, c'est vérifier d'un coup d'œil la cohérence des distances, des temps de voyage, des retrouvailles. Pour une saga à la géographie dense, c'est un garde-fou autant qu'un plaisir.</p>
<figure class="blog-figure">
  <img src="/blog/lotr-carte.png" alt="La carte interactive d'Atlas Narratif&#8239;: les trajets des personnages du Seigneur des Anneaux tracés à travers la Terre du Milieu, de la Comté au Mordor." loading="lazy" />
  <figcaption>Les trajets des personnages tracés sur la Terre du Milieu (démo LOTR).</figcaption>
</figure>

<h2>📚 Ce que ça t'apprend pour ta saga</h2>
<p>Tu n'écriras pas <em>Le Seigneur des Anneaux</em>, et c'est très bien. Mais trois leçons de structure valent pour n'importe quelle série&#8239;:</p>
<ul>
  <li><strong>Un grand arc, et un arc par tome.</strong> Chaque volume doit se tenir seul tout en servant l'ensemble.</li>
  <li><strong>Entrelace tes arcs de personnages.</strong> Décale les courbes pour qu'il y ait toujours une tension qui monte quelque part.</li>
  <li><strong>Tiens le registre de tes promesses.</strong> Chaque amorce est une dette&#8239;: note-la, et paie-la au meilleur moment.</li>
</ul>

<h2>✅ En résumé</h2>
<p>Si <em>Le Seigneur des Anneaux</em> traverse trois tomes sans faiblir, ce n'est pas magique&#8239;: c'est une structure d'orfèvre. Des beats bien placés, des Voyages du Héros entrelacés, des amorces semées tôt et payées au bon moment, une géographie qui porte la tension. Les mêmes outils sont à ta portée pour ta propre saga.</p>
<p>Tout ce que tu viens de voir vit dans la <strong>démo d'Atlas Narratif</strong>&#8239;: la trilogie entière, ses beats, ses arcs, ses amorces et sa carte. Explore-la sans créer de compte, puis structure la tienne. L'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com/demo">Explore la structure du Seigneur des Anneaux dans la démo</a>, puis lance ta propre saga gratuitement.</p>
`,
};

const detecterIncoherences = {
  slug: 'detecter-incoherences-roman',
  pillar: 'P1',
  metaTitle: 'Détecter les incohérences de son roman : la checklist',
  title: 'Détecter les incohérences dans ton roman : la checklist',
  description:
    'La checklist pour détecter les incohérences de ton roman : continuité, chronologie, personnages, univers, intrigue. Repère-les avant tes lecteurs.',
  excerpt:
    'Yeux qui changent de couleur, âge qui dérive, amorce oubliée : la checklist des cinq familles d\'incohérences, pour les traquer avant tes lecteurs.',
  date: '2026-10-09',
  readingTime: '8 min',
  tags: ['Incohérences', 'Cohérence', 'Relecture', 'Checklist'],
  emoji: '🔍',
  html: `
<p>Un lecteur pardonne beaucoup de choses. Une intrigue un peu lente, un style perfectible, un personnage secondaire sous-exploité. Mais il y a une faute qui le fait décrocher net&#8239;: l'incohérence. Le personnage aux yeux verts au tome 1, bleus au tome 3. Le trajet qui prend trois jours à l'aller et une semaine au retour. La promesse du chapitre 3 qu'on attend encore à la fin.</p>
<p>Ces failles cassent l'immersion et, pire, la confiance. Voici comment les traquer méthodiquement, avec une checklist par famille et les bons réflexes de relecture.</p>

<h2>🔍 Pourquoi une incohérence casse tout</h2>
<p>Quand un lecteur plonge dans ton roman, il signe un pacte&#8239;: il accepte de croire à ton monde. Chaque incohérence rompt ce pacte. Le charme se brise, le lecteur sort de l'histoire, et surtout il commence à <em>douter</em> de tout le reste. Une seule contradiction visible, et il se met à chercher les autres.</p>
<p>Le problème, c'est que ces failles sont presque invisibles pour toi. Tu connais ton histoire par cœur&#8239;; ton cerveau corrige automatiquement ce qui cloche. C'est justement pour ça qu'une <strong>méthode</strong> vaut mieux qu'une relecture au feeling.</p>

<h2>🧩 Les cinq familles d'incohérences</h2>
<p>Presque toutes les incohérences se rangent dans cinq familles. Les connaître, c'est savoir où regarder.</p>
<h3>1. La continuité</h3>
<p>Les détails physiques et matériels qui changent sans raison&#8239;: couleur des yeux ou des cheveux, cicatrice qui disparaît, objet perdu puis réutilisé, vêtement qui change en pleine scène. Ce sont les plus fréquentes et les plus repérables par le lecteur.</p>
<h3>2. La chronologie</h3>
<p>Tout ce qui touche au temps&#8239;: l'âge d'un personnage qui ne colle pas, un temps de voyage incohérent, deux scènes impossibles au même moment, une saison qui saute. Et le piège classique&#8239;: <strong>qui sait quoi, et quand&#8239;?</strong> Un personnage ne peut pas réagir à une information qu'il n'a pas encore reçue.</p>
<h3>3. Les personnages</h3>
<p>Un comportement qui trahit la personnalité établie, une voix qui change, une motivation qui s'évapore, un nom mal orthographié d'un chapitre à l'autre. Le lecteur connaît tes personnages&#8239;: il sent tout de suite quand l'un d'eux «&#8239;sort du rôle&#8239;».</p>
<h3>4. L'univers</h3>
<p>Les règles de ton monde doivent tenir&#8239;: une magie qui fonctionne autrement selon les besoins de l'intrigue, une technologie qui apparaît puis disparaît, une géographie qui se contredit, une hiérarchie sociale flottante. En fantasy et en SF, c'est le nerf de la crédibilité.</p>
<h3>5. L'intrigue</h3>
<p>Les failles de logique narrative&#8239;: une amorce jamais résolue, une solution qui sort de nulle part (le <em>deus ex machina</em>), un problème que le héros aurait pu régler cent pages plus tôt, un enjeu qu'on oublie en route. Ce sont les plus graves, car elles touchent la charpente.</p>

<h2>✅ Ta checklist de relecture cohérence</h2>
<p>Une fois ton jet terminé, passe l'histoire au crible avec ces questions. Relis en <strong>traquant une famille à la fois</strong>&#8239;: on repère bien mieux en cherchant une seule chose.</p>
<ol>
  <li><strong>Fiches personnages.</strong> Chaque trait physique est-il constant du début à la fin&#8239;? Les noms sont-ils toujours orthographiés pareil&#8239;?</li>
  <li><strong>Ligne du temps.</strong> Les âges, les dates, les durées de trajet s'emboîtent-ils&#8239;? Aucune scène n'en chevauche une autre&#8239;?</li>
  <li><strong>Qui sait quoi.</strong> Pour chaque révélation, vérifie que ceux qui réagissent l'ont bien apprise avant.</li>
  <li><strong>Règles du monde.</strong> Ta magie, ta techno, ta géographie obéissent-elles aux mêmes lois d'un bout à l'autre&#8239;?</li>
  <li><strong>Promesses tenues.</strong> Chaque amorce trouve-t-elle son paiement&#8239;? Chaque objet mis en avant sert-il&#8239;?</li>
  <li><strong>Comportements.</strong> Chaque personnage agit-il selon ce qu'on sait de lui&#8239;? Ses volte-face sont-elles justifiées&#8239;?</li>
</ol>

<h2>🤖 Détecter automatiquement</h2>
<p>Cette relecture est indispensable, mais elle est fastidieuse, surtout sur un long manuscrit. C'est exactement le genre de travail qu'une machine fait sans se fatiguer&#8239;: comparer des centaines de détails et signaler ce qui cloche.</p>
<p>Le détecteur d'incohérences d'<strong>Atlas Narratif</strong> passe ton histoire au crible avec plus de 12 détecteurs, puis trie les problèmes par gravité&#8239;: du critique au faible. Chaque incohérence est expliquée, reliée aux entités concernées, et accompagnée d'une piste de correction.</p>
<figure class="blog-figure">
  <img src="/blog/incoherences-checklist.png" alt="Le détecteur d'incohérences d'Atlas Narratif&#8239;: les incohérences classées par gravité (critique, élevée, moyenne, faible), chacune expliquée avec un bouton pour la corriger." loading="lazy" />
  <figcaption>Chaque incohérence est expliquée et reliée aux entités concernées (démo LOTR).</figcaption>
</figure>

<h2>🗺️ Le cas des sagas</h2>
<p>Sur un roman unique, la relecture manuelle reste tenable. Sur une <strong>saga</strong> de plusieurs tomes et centaines de milliers de mots, c'est une autre affaire&#8239;: les incohérences se glissent entre les tomes, là où ta mémoire lâche. Un personnage vieillit de travers, une règle du monde dérive, une amorce du tome 1 se perd. C'est là qu'une détection outillée devient un vrai garde-fou. On en parle dans notre guide sur <a href="/blog/gerer-plusieurs-tomes-saga">comment gérer plusieurs tomes sans perdre le fil</a>.</p>

<h2>⚠️ Les erreurs classiques</h2>
<ul>
  <li><strong>Relire tout en même temps.</strong> Chercher toutes les familles d'un coup, c'est n'en repérer aucune. Une passe = une famille.</li>
  <li><strong>Relire à chaud.</strong> Juste après avoir écrit, ton cerveau corrige tout seul. Laisse reposer quelques jours avant la passe cohérence.</li>
  <li><strong>Se fier à sa seule mémoire.</strong> Tiens des fiches, une timeline, un registre d'amorces. La mémoire ment, surtout sur la durée.</li>
  <li><strong>Confondre incohérence et mystère.</strong> Une zone d'ombre volontaire n'est pas une faille&#8239;: garde une trace de ce qui est intentionnel pour ne pas «&#8239;corriger&#8239;» un vrai ressort.</li>
</ul>

<h2>🧭 En résumé</h2>
<p>Une incohérence, c'est une fissure dans le pacte que tu passes avec ton lecteur. Traque-les par famille, continuité, chronologie, personnages, univers, intrigue, une passe à la fois, et appuie-toi sur des fiches plutôt que sur ta mémoire. Sur une saga, une détection automatique devient vite indispensable.</p>
<p><strong>Atlas Narratif</strong> repère ces failles pour toi&#8239;: plus de 12 détecteurs, un tri par gravité, une piste de correction pour chacune, et un suivi de tes amorces d'un tome à l'autre. Gratuit, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Traque les incohérences de ton roman gratuitement avec Atlas Narratif.</a> Et si tu as déjà un manuscrit, importe-le pour lancer la détection en quelques minutes.</p>
`,
};

const sagaArcsDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 300" role="img" aria-label="Un grand arc en pointillé qui monte à travers trois tomes, et sous lui l'arc propre à chaque tome, qui monte et redescend en partie." style="width:100%;height:auto">
    <line x1="60" y1="240" x2="680" y2="240" stroke="#ffffff" stroke-opacity="0.14"/>
    <line x1="266" y1="60" x2="266" y2="240" stroke="#ffffff" stroke-opacity="0.1"/>
    <line x1="473" y1="60" x2="473" y2="240" stroke="#ffffff" stroke-opacity="0.1"/>
    <polyline fill="none" stroke="#cba15e" stroke-width="2.5" stroke-dasharray="6 5" points="60,215 680,66"/>
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="60,215 120,150 200,132 266,178 330,140 400,104 473,150 540,120 610,78 680,66"/>
    <g font-family="'Spectral',Georgia,serif" fill="#ece7db" font-size="15" text-anchor="middle">
      <text x="163" y="268">TOME 1</text>
      <text x="369" y="268">TOME 2</text>
      <text x="576" y="268">TOME 3</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11.5">
      <rect x="150" y="20" width="12" height="12" rx="3" fill="#cba15e"/>
      <text x="172" y="30" fill="#a9a291">le grand arc, sur toute la saga</text>
      <rect x="430" y="20" width="12" height="12" rx="3" fill="#5cae8e"/>
      <text x="452" y="30" fill="#a9a291">l'arc propre à chaque tome</text>
    </g>
  </svg>
  <figcaption>Deux niveaux à tenir en même temps&#8239;: le grand arc qui monte sur toute la saga, et l'arc complet de chaque tome.</figcaption>
</figure>`;

const gererPlusieursTomes = {
  slug: 'gerer-plusieurs-tomes-saga',
  pillar: 'P2',
  metaTitle: 'Gérer plusieurs tomes : écrire une saga sans se perdre',
  title: 'Comment gérer plusieurs tomes sans perdre le fil',
  description:
    'Écrire une saga en plusieurs tomes sans perdre le fil : grand arc et arcs de tome, amorces cross-tomes, cohérence sur la durée. La méthode complète.',
  excerpt:
    'Pourquoi le tome 2 fait caler tant de sagas ? Grand arc, arcs de tome, amorces qui traversent les volumes : la méthode pour tenir une série entière.',
  date: '2026-10-13',
  readingTime: '9 min',
  tags: ['Saga', 'Multi-tomes', 'Cohérence', 'Méthode'],
  emoji: '📚',
  html: `
<p>Écrire <em>un</em> roman est difficile. Écrire <em>une série</em> de trois, cinq, sept tomes qui tiennent ensemble, c'est un autre métier. Beaucoup d'auteurs se lancent, portés par l'élan du premier tome, et s'enlisent au deuxième. Trop de fils à tenir, une intrigue qui se dilue, des détails qu'on ne retrouve plus.</p>
<p>Écrire une saga, ce n'est pas empiler des romans&#8239;: c'est bâtir une architecture à deux étages. Voici comment garder le fil, du tome 1 au dernier point final.</p>

<h2>📚 Pourquoi le tome 2 est un piège</h2>
<p>Le premier tome bénéficie de tout&#8239;: l'énergie de la découverte, la nouveauté du monde, un arc que tu as sans doute mûri des années. Le tome 2 n'a rien de tout ça. Il doit relancer sans tout réexpliquer, avancer sans conclure, tenir la tension sans le vernis du neuf.</p>
<p>C'est le fameux <strong>«&#8239;syndrome du tome 2&#8239;»</strong>&#8239;: un volume qui n'est qu'un long couloir entre l'ouverture éclatante et le grand final. La cause est presque toujours la même&#8239;: le tome n'a pas <em>son propre</em> arc. Ce qui nous amène à la clé de toute saga.</p>

<h2>🏛️ Grand arc et arcs de tome</h2>
<p>Une saga se pilote sur <strong>deux niveaux à la fois</strong>&#8239;:</p>
<ul>
  <li><strong>Le grand arc</strong> traverse toute la série&#8239;: la question centrale posée au tome 1 ne trouve sa réponse qu'au dernier. C'est la destruction de l'Anneau, la chute de l'Empire, la vengeance accomplie.</li>
  <li><strong>L'arc de chaque tome</strong> est une histoire complète en miniature&#8239;: son propre objectif, son climax, sa résolution partielle. Le tome doit se tenir seul <em>tout en</em> faisant avancer le grand arc.</li>
</ul>
<p>Un tome sans arc propre s'affaisse&#8239;; un tome qui ignore le grand arc n'est qu'un épisode hors-sol. La maîtrise, c'est de tenir les deux ensemble.</p>
${sagaArcsDiagram}

<h2>🌱 Les amorces qui traversent les tomes</h2>
<p>Sur un roman, une amorce posée au chapitre 3 se paie au chapitre 30. Sur une saga, elle peut se payer <strong>deux tomes plus loin</strong>, et c'est là que naissent les plus beaux effets, comme les plus gros oublis.</p>
<p>Une lame trouvée dans un tumulus au tome 1, la seule capable de briser le sortilège du Roi-Sorcier deux tomes plus tard. Un cadeau anodin qui sauve un héros deux volumes plus loin. Un détail glissé négligemment qui devient la clé du dénouement. Chaque amorce est une <strong>dette narrative</strong>&#8239;: si tu ne la notes pas, tu finiras par la perdre, et le lecteur, lui, s'en souviendra. Tenir ce registre à l'échelle de la série entière est vital.</p>
<figure class="blog-figure">
  <img src="/blog/amorces-paiements.png" alt="Le suivi des amorces et paiements dans Atlas Narratif&#8239;: chaque promesse reliée du tome où elle est posée à celui où elle est résolue, avec son statut." loading="lazy" />
  <figcaption>Chaque amorce suivie de sa mise en place à son paiement, d'un tome à l'autre (démo LOTR).</figcaption>
</figure>

<h2>🧭 Tenir la cohérence sur la durée</h2>
<p>Plus une saga s'étend, plus les incohérences se multiplient, et elles se cachent <em>entre</em> les tomes, là où ta mémoire faiblit. Trois points de vigilance&#8239;:</p>
<ul>
  <li><strong>Les âges et le temps.</strong> Si cinq ans séparent le tome 1 du tome 3, tous tes personnages ont vieilli d'autant. Une timeline à l'échelle de la série t'évite le piège de l'enfant resté figé pendant que le monde vieillit.</li>
  <li><strong>Les règles du monde.</strong> Ta magie, ta géographie, ta politique doivent obéir aux mêmes lois du premier au dernier tome. Une bible d'univers tenue à jour est ta référence.</li>
  <li><strong>Qui sait quoi, et depuis quand.</strong> Sur des milliers de pages, il est facile de faire réagir un personnage à une information qu'il n'a pas encore.</li>
</ul>
<p>Traquer tout ça à la main, sur une série entière, est presque impossible. C'est le rôle d'un <a href="/blog/detecter-incoherences-roman">détecteur d'incohérences</a>, qui compare les détails d'un tome à l'autre et signale ce qui dérive.</p>

<h2>🗺️ La géographie, colonne vertébrale de la saga</h2>
<p>Dans une série, les personnages se dispersent, se retrouvent, parcourent des continents. Visualiser leurs trajets sur une carte, tome après tome, c'est vérifier d'un coup d'œil la cohérence des distances et des retrouvailles, et repérer qui est où à chaque instant.</p>
<figure class="blog-figure">
  <img src="/blog/lotr-carte.png" alt="La carte interactive d'Atlas Narratif&#8239;: les trajets des personnages tracés à travers la Terre du Milieu, d'un tome à l'autre." loading="lazy" />
  <figcaption>Les trajets des personnages tracés sur toute la saga, tome après tome (démo LOTR).</figcaption>
</figure>

<h2>🧩 Piloter une saga, pas-à-pas</h2>
<ol>
  <li><strong>Définis ton grand arc en une phrase.</strong> La question centrale de toute la série, et sa réponse au dernier tome.</li>
  <li><strong>Donne à chaque tome son propre arc.</strong> Un objectif, un climax, une résolution partielle qui fait avancer le tout.</li>
  <li><strong>Tiens un registre d'amorces à l'échelle de la série.</strong> Ce que tu promets, et le tome où tu comptes le payer.</li>
  <li><strong>Maintiens une bible et une timeline vivantes.</strong> Personnages, règles du monde, chronologie&#8239;: mets-les à jour au fil de l'écriture.</li>
  <li><strong>Fais une passe cohérence entre chaque tome.</strong> Ne laisse pas les failles s'accumuler d'un volume à l'autre.</li>
</ol>

<h2>⚠️ Les erreurs classiques</h2>
<ul>
  <li><strong>Le tome tunnel.</strong> Un volume sans arc propre, simple pont vers le final. Chaque tome doit tenir debout tout seul.</li>
  <li><strong>Les amorces oubliées.</strong> Semer sans jamais récolter&#8239;: le lecteur le ressent, même sans savoir nommer sa frustration.</li>
  <li><strong>La bible dans ta tête.</strong> Sur cinq ans d'écriture, la mémoire ne suffit plus. Écris tes règles, tes fiches, ta chronologie.</li>
  <li><strong>Résoudre trop tôt.</strong> Vider tous tes enjeux au tome 1 te laisse les mains vides pour la suite. Garde des cartes en réserve.</li>
</ul>

<h2>✅ En résumé</h2>
<p>Une saga, c'est une architecture à deux étages&#8239;: un grand arc qui court sur toute la série, et un arc complet par tome. Tiens un registre de tes amorces d'un volume à l'autre, maintiens une bible et une timeline vivantes, et fais une passe cohérence entre chaque tome. C'est ainsi qu'on garde le fil sur des milliers de pages.</p>
<p><strong>Atlas Narratif</strong> a été pensé pour les séries&#8239;: filtre par tome, suis tes amorces d'un volume à l'autre, visualise ta timeline et tes trajets, et repère les incohérences avant tes lecteurs. Gratuit, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Construis ta saga sans perdre le fil avec Atlas Narratif.</a> Un tome, puis deux, puis toute une série, gardés sous tes yeux.</p>
`,
};

const saveTheCatOuVoyageDuHerosDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 404" role="img" aria-label="Save the Cat et le Voyage du Héros superposés sur la même ligne de temps : en haut, les 15 beats à leur position idéale dans les trois actes ; en bas, les 12 étapes du héros dans les trois phases. Des traits relient les correspondances : élément déclencheur et appel, basculement et seuil, finale et résurrection. L'épreuve suprême flotte entre le milieu et tout est perdu." style="width:100%;height:auto">
    <g font-family="ui-monospace,Menlo,monospace" font-size="12" fill="#a9a291">
      <text x="40" y="22">SAVE THE CAT · CE QUI ARRIVE, ET QUAND</text>
      <text x="40" y="362">VOYAGE DU HÉROS · CE QUE LE HÉROS DEVIENT</text>
    </g>
    <g>
      <rect x="40" y="34" width="159" height="18" rx="3" fill="#cba15e" fill-opacity="0.14"/>
      <rect x="201" y="34" width="350" height="18" rx="3" fill="#cba15e" fill-opacity="0.14"/>
      <rect x="553" y="34" width="127" height="18" rx="3" fill="#cba15e" fill-opacity="0.14"/>
      <rect x="40" y="322" width="159" height="18" rx="3" fill="#5cae8e" fill-opacity="0.14"/>
      <rect x="201" y="322" width="350" height="18" rx="3" fill="#5cae8e" fill-opacity="0.14"/>
      <rect x="553" y="322" width="127" height="18" rx="3" fill="#5cae8e" fill-opacity="0.14"/>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="10.5" text-anchor="middle">
      <text x="120" y="47" fill="#cba15e">ACTE I</text>
      <text x="376" y="47" fill="#cba15e">ACTE II</text>
      <text x="616" y="47" fill="#cba15e">ACTE III</text>
      <text x="120" y="335" fill="#5cae8e">DÉPART</text>
      <text x="376" y="335" fill="#5cae8e">INITIATION</text>
      <text x="616" y="335" fill="#5cae8e">RETOUR</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11" fill="#ece7db" text-anchor="middle">
      <text x="104" y="78">Déclencheur</text>
      <text x="200" y="78">Basculement</text>
      <text x="360" y="78">Milieu</text>
      <text x="520" y="78">Tout est perdu</text>
      <text x="616" y="78">Finale</text>
      <text x="104" y="308">Appel</text>
      <text x="200" y="308">Seuil</text>
      <text x="424" y="308">Épreuve suprême</text>
      <text x="616" y="308">Résurrection</text>
    </g>
    <line x1="40" y1="196" x2="680" y2="196" stroke="#ffffff" stroke-opacity="0.16"/>
    <g stroke="#ffffff" stroke-opacity="0.3">
      <line x1="40" y1="191" x2="40" y2="201"/>
      <line x1="200" y1="191" x2="200" y2="201"/>
      <line x1="360" y1="191" x2="360" y2="201"/>
      <line x1="520" y1="191" x2="520" y2="201"/>
      <line x1="680" y1="191" x2="680" y2="201"/>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="10.5" fill="#a9a291">
      <text x="44" y="214">0&#8239;%</text>
      <text x="204" y="214">25&#8239;%</text>
      <text x="364" y="214">50&#8239;%</text>
      <text x="524" y="214">75&#8239;%</text>
      <text x="676" y="214" text-anchor="end">100&#8239;%</text>
    </g>
    <g stroke="#ece7db" stroke-opacity="0.28" stroke-width="1.2">
      <line x1="59.2" y1="269" x2="46.4" y2="111"/>
      <line x1="104" y1="269" x2="104" y2="111"/>
      <line x1="142.4" y1="269" x2="155.2" y2="111"/>
      <line x1="200" y1="269" x2="200" y2="111"/>
      <line x1="264" y1="269" x2="276.8" y2="111"/>
      <line x1="475.2" y1="269" x2="443.2" y2="111"/>
      <line x1="564.8" y1="269" x2="552" y2="111"/>
      <line x1="616" y1="269" x2="616" y2="111"/>
      <line x1="673.6" y1="269" x2="673.6" y2="111"/>
    </g>
    <g stroke="#cba15e" stroke-width="1.5" stroke-dasharray="5 4">
      <line x1="424" y1="269" x2="360" y2="111"/>
      <line x1="424" y1="269" x2="520" y2="111"/>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11" fill="#cba15e">
      <text x="378" y="170" text-anchor="end">Vogler</text>
      <text x="490" y="170">courant</text>
    </g>
    <g font-family="'Spectral',Georgia,serif" fill="#0b1621" font-size="12" font-weight="600" text-anchor="middle">
      <g><circle cx="46.4"  cy="100" r="11" fill="#cba15e"/><text x="46.4"  y="104">1</text></g>
      <g><circle cx="72"    cy="100" r="11" fill="#cba15e"/><text x="72"    y="104">2</text></g>
      <g><circle cx="84.8"  cy="128" r="11" fill="#cba15e"/><text x="84.8"  y="132">3</text></g>
      <g><circle cx="104"   cy="100" r="11" fill="#cba15e"/><text x="104"   y="104">4</text></g>
      <g><circle cx="155.2" cy="100" r="11" fill="#cba15e"/><text x="155.2" y="104">5</text></g>
      <g><circle cx="200"   cy="100" r="11" fill="#cba15e"/><text x="200"   y="104">6</text></g>
      <g><circle cx="232"   cy="100" r="11" fill="#cba15e"/><text x="232"   y="104">7</text></g>
      <g><circle cx="276.8" cy="100" r="11" fill="#cba15e"/><text x="276.8" y="104">8</text></g>
      <g><circle cx="360"   cy="100" r="11" fill="#cba15e"/><text x="360"   y="104">9</text></g>
      <g><circle cx="443.2" cy="100" r="11" fill="#cba15e"/><text x="443.2" y="104">10</text></g>
      <g><circle cx="520"   cy="100" r="11" fill="#cba15e"/><text x="520"   y="104">11</text></g>
      <g><circle cx="539.2" cy="128" r="11" fill="#cba15e"/><text x="539.2" y="132">12</text></g>
      <g><circle cx="552"   cy="100" r="11" fill="#cba15e"/><text x="552"   y="104">13</text></g>
      <g><circle cx="616"   cy="100" r="11" fill="#cba15e"/><text x="616"   y="104">14</text></g>
      <g><circle cx="673.6" cy="100" r="11" fill="#cba15e"/><text x="673.6" y="104">15</text></g>
      <g><circle cx="59.2"  cy="280" r="11" fill="#5cae8e"/><text x="59.2"  y="284">1</text></g>
      <g><circle cx="104"   cy="280" r="11" fill="#5cae8e"/><text x="104"   y="284">2</text></g>
      <g><circle cx="142.4" cy="280" r="11" fill="#5cae8e"/><text x="142.4" y="284">3</text></g>
      <g><circle cx="174.4" cy="280" r="11" fill="#5cae8e"/><text x="174.4" y="284">4</text></g>
      <g><circle cx="200"   cy="280" r="11" fill="#5cae8e"/><text x="200"   y="284">5</text></g>
      <g><circle cx="264"   cy="280" r="11" fill="#5cae8e"/><text x="264"   y="284">6</text></g>
      <g><circle cx="328"   cy="280" r="11" fill="#5cae8e"/><text x="328"   y="284">7</text></g>
      <g><circle cx="424"   cy="280" r="11" fill="#5cae8e"/><text x="424"   y="284">8</text></g>
      <g><circle cx="475.2" cy="280" r="11" fill="#5cae8e"/><text x="475.2" y="284">9</text></g>
      <g><circle cx="564.8" cy="280" r="11" fill="#5cae8e"/><text x="564.8" y="284">10</text></g>
      <g><circle cx="616"   cy="280" r="11" fill="#5cae8e"/><text x="616"   y="284">11</text></g>
      <g><circle cx="673.6" cy="280" r="11" fill="#5cae8e"/><text x="673.6" y="284">12</text></g>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11" fill="#a9a291">
      <circle cx="46" cy="386" r="6" fill="#cba15e"/>
      <text x="58" y="390">Beat (position idéale)</text>
      <circle cx="256" cy="386" r="6" fill="#5cae8e"/>
      <text x="268" y="390">Étape du héros</text>
      <line x1="420" y1="386" x2="446" y2="386" stroke="#cba15e" stroke-width="1.5" stroke-dasharray="5 4"/>
      <text x="452" y="390">Correspondance flottante</text>
    </g>
  </svg>
  <figcaption>Les 15 beats (en haut) et les 12 étapes (en bas) sur la même ligne de temps. Les actes et les phases se recouvrent presque exactement&#8239;; seule l'épreuve suprême change de place selon la lecture que tu choisis.</figcaption>
</figure>`;

const saveTheCatOuVoyageDuHeros = {
  slug: 'save-the-cat-ou-voyage-du-heros',
  pillar: 'P2',
  metaTitle: 'Save the Cat ou Voyage du Héros : quelle méthode ?',
  title: 'Save the Cat ou Voyage du Héros : quelle méthode pour ton roman ?',
  description:
    'Save the Cat ou Voyage du Héros ? Intrigue ou transformation, genre, profil : le guide pour choisir ta méthode, ou superposer les deux, avant novembre.',
  excerpt:
    'L\'une structure ce qui arrive, l\'autre ce que ton héros devient. Forces, limites, genre, profil et mini-quiz pour choisir (ou superposer) avant le 1er novembre.',
  date: '2026-10-20',
  readingTime: '9 min',
  tags: ['Save the Cat', 'Voyage du Héros', 'Méthode', 'Structure'],
  emoji: '⚖️',
  html: `
<p>Fin octobre. Ta prémisse tient en une phrase, ton héros a un prénom, le défi d'écriture de novembre approche, et tu bloques sur une question bête en apparence&#8239;: <strong>Save the Cat ou Voyage du Héros&#8239;?</strong> Et chaque soir de Preptober passé à hésiter est un soir de préparation en moins.</p>
<p>On ne va pas te réexpliquer les 15 beats ni les 12 étapes&#8239;: on l'a fait en détail dans <a href="/blog/la-methode-save-the-cat-15-beats">la méthode Save the Cat</a> et dans <a href="/blog/voyage-du-heros-12-etapes">les 12 étapes du Voyage du Héros</a>. Ici, on t'aide à <strong>décider</strong>&#8239;: ce que chaque méthode structure vraiment, laquelle colle à ton genre et à ta façon d'écrire, comment les superposer. Et un mini-quiz pour trancher en deux minutes.</p>

<h2>🧭 Deux méthodes, deux questions différentes</h2>
<p>On les présente comme deux concurrentes. Elles ne répondent pourtant pas à la même question.</p>
<ul>
  <li><strong>Save the Cat structure l'intrigue.</strong> Elle te dit <em>ce qui doit arriver, et quand</em>. Chaque beat a une position dans le livre, exprimée en pourcentage&#8239;: l'élément déclencheur (le catalyseur de Snyder) vers 10&#8239;%, le milieu à 50&#8239;%, «&#8239;tout est perdu&#8239;» vers 75&#8239;%. C'est une horloge.</li>
  <li><strong>Le Voyage du Héros structure la transformation.</strong> Il te dit <em>qui ton héros devient</em>, et par quels passages. Aucune étape n'a d'horaire&#8239;: ce qui compte, c'est l'ordre des mues. C'est une boussole.</li>
</ul>
<p>Conséquence souvent oubliée&#8239;: une beat sheet se remplit <strong>une fois par livre</strong> (ou par tome), alors qu'un Voyage du Héros se trace <strong>une fois par personnage</strong>. Frodon, Aragorn et Sam n'ont pas le même voyage, mais <em>La Communauté de l'Anneau</em> n'a qu'un seul milieu.</p>
<p>Garde cette phrase en tête, elle guide tout le reste&#8239;: <strong>Save the Cat répond à «&#8239;quand&#8239;?&#8239;», le Voyage du Héros répond à «&#8239;pour devenir qui&#8239;?&#8239;»</strong></p>

<h2>⚖️ Forces et limites, sans langue de bois</h2>
<h3>Save the Cat</h3>
<ul>
  <li><strong>Force&#8239;: la précision.</strong> Tu sais où placer chaque temps fort et tu repères un ventre mou avant de l'écrire.</li>
  <li><strong>Force&#8239;: le diagnostic.</strong> Comme chaque beat a une position idéale, tu peux mesurer l'écart. Un élément déclencheur au chapitre 8 sur 30, ça se voit.</li>
  <li><strong>Limite&#8239;: l'origine cinéma.</strong> La méthode vient du scénario (Blake Snyder, 2005)&#8239;; Jessica Brody l'a adaptée au roman en 2018, mais un roman de 400 pages respire plus qu'un film de deux heures. Prends les pourcentages comme des repères, pas comme des bornes.</li>
  <li><strong>Limite&#8239;: un seul arc.</strong> La méthode suit une intrigue principale et une sous-intrigue. Un roman choral à cinq points de vue la fait vite craquer.</li>
</ul>
<h3>Le Voyage du Héros</h3>
<ul>
  <li><strong>Force&#8239;: la profondeur.</strong> Il t'oblige à penser l'arc intérieur&#8239;: la peur du début, ce que le héros comprend à la fin.</li>
  <li><strong>Force&#8239;: il passe à l'échelle.</strong> Un voyage par personnage, sur un tome ou toute une saga&#8239;: idéal pour les récits à plusieurs héros.</li>
  <li><strong>Limite&#8239;: aucun tempo.</strong> Tu peux cocher les 12 étapes et traîner quand même un deuxième acte interminable.</li>
  <li><strong>Limite&#8239;: la pente du cliché.</strong> Élu, mentor à barbe blanche, objet à rapporter&#8239;: appliqué au premier degré, il fabrique du déjà-vu. Et il colle mal aux histoires sans quête, comme un huis clos familial.</li>
</ul>

<h2>📚 Quelle méthode selon ton genre</h2>
<ul>
  <li><strong>Thriller, polar, romance, comédie, feel-good</strong>&#8239;: Save the Cat. Ces genres vivent de leurs retournements et du «&#8239;encore un chapitre&#8239;»&#8239;: le rythme est le contrat.</li>
  <li><strong>Fantasy, SF, récit de quête, roman d'apprentissage</strong>&#8239;: le Voyage du Héros. Dès que ton personnage traverse un monde plus grand que lui pour en revenir changé, il est chez lui.</li>
  <li><strong>Littérature générale, roman intimiste</strong>&#8239;: un Voyage du Héros allégé (l'arc intérieur, sans dragons) et trois beats de sécurité&#8239;: l'élément déclencheur, le milieu, «&#8239;tout est perdu&#8239;».</li>
  <li><strong>Saga</strong>&#8239;: les deux, à deux échelles. Save the Cat tome par tome, pour que chaque volume ait sa propre courbe&#8239;; le Voyage du Héros personnage par personnage, sur toute la série.</li>
</ul>

<h2>🌱 Architecte ou jardinier&#8239;?</h2>
<p>George R. R. Martin distingue deux familles d'auteurs&#8239;: les <strong>architectes</strong>, qui dessinent les plans avant de poser une brique, et les <strong>jardiniers</strong>, qui plantent une graine et regardent ce qui pousse.</p>
<ul>
  <li><strong>Tu es architecte&#8239;?</strong> Save the Cat est ton terrain de jeu. Tu poses tes 15 beats en octobre, et novembre devient de l'exécution. Ton risque&#8239;: un plan si serré que tes personnages n'ont plus le droit de te surprendre. Ajoute un Voyage du Héros pour ton protagoniste&#8239;: il te rappellera que l'intrigue sert une transformation.</li>
  <li><strong>Tu es jardinier&#8239;?</strong> Le Voyage du Héros est une boussole qui ne t'enferme pas&#8239;: tu connais le point de départ intérieur de ton héros et son point d'arrivée, le reste se découvre en écrivant. Garde Save the Cat pour décembre, comme <strong>outil de diagnostic</strong>. Jet fini, tu regardes où sont tombés ton milieu et ton «&#8239;tout est perdu&#8239;», et tu sais quoi retravailler.</li>
  <li><strong>Tu es entre les deux&#8239;?</strong> Le kit minimal&#8239;: l'arc intérieur en une phrase, plus cinq bornes (élément déclencheur, basculement, milieu, tout est perdu, finale). On détaille cette prep express dans <a href="/blog/planifier-roman-novembre-methode">notre méthode pour planifier ton roman de novembre</a>.</li>
</ul>

<h2>🔀 Superposer les deux méthodes</h2>
<p>Bonne nouvelle&#8239;: tu n'as pas vraiment à choisir. Posées sur la même ligne de temps, les deux méthodes se répondent presque point par point.</p>
${saveTheCatOuVoyageDuHerosDiagram}
<p>Les correspondances à retenir&#8239;:</p>
<ul>
  <li><strong>Élément déclencheur = appel à l'aventure.</strong> Le même événement, vu de l'extérieur et de l'intérieur.</li>
  <li><strong>Moment de réflexion = refus de l'appel.</strong> Le «&#8239;débat&#8239;» de Snyder, c'est le refus de Campbell. Le mentor, lui, n'a pas de beat attitré chez Snyder&#8239;: à toi de lui trouver une place dans le premier acte.</li>
  <li><strong>Basculement = franchissement du seuil.</strong> Le passage au deuxième acte de Snyder referme aussi le Départ de Campbell&#8239;: sur ce virage, les deux méthodes s'accordent au millimètre.</li>
  <li><strong>Finale = résurrection, scène finale = retour avec l'élixir.</strong> Le climax de l'intrigue est aussi la renaissance du héros, et l'image finale montre ce qu'il rapporte.</li>
</ul>
<p>Un seul point fait débat, et il est instructif&#8239;: <strong>l'épreuve suprême</strong>. Chez Christopher Vogler, elle tombe au cœur du deuxième acte, près du milieu. Beaucoup d'auteurs la font plutôt coïncider avec «&#8239;tout est perdu&#8239;». Les deux se défendent&#8239;: la première muscle ton milieu, la seconde concentre la crise dans le dernier quart.</p>

<h3>Le test sur Le Seigneur des Anneaux</h3>
<p>Dans la démo d'Atlas, le premier tome est découpé en 9 chapitres. Côté intrigue, les 15 beats sont posés sur des scènes&#8239;; côté transformation, le Voyage de Frodon est tracé étape par étape. Superpose-les&#8239;:</p>
<ul>
  <li><strong>Chapitre 2.</strong> Gandalf révèle la vérité sur l'Anneau. Pour l'intrigue, c'est l'élément déclencheur. Pour Frodon, c'est à la fois l'appel, le refus (il tente de confier l'Anneau à Gandalf) et la rencontre du mentor.</li>
  <li><strong>Chapitre 7.</strong> Gandalf chute au pont de Khazad-dûm. «&#8239;Tout est perdu&#8239;» côté intrigue, épreuve suprême côté Frodon&#8239;: la Communauté perd son guide, et Frodon doit commencer à assumer seul. Dans <a href="/blog/structure-seigneur-des-anneaux">notre analyse de la structure du Seigneur des Anneaux</a>, on lisait cette chute comme le milieu du tome&#8239;: placer un beat est une lecture, pas un fait.</li>
  <li><strong>Chapitre 8.</strong> La Lothlórien. Pour l'intrigue, c'est la nuit noire de l'âme&#8239;: on pleure Gandalf. Pour Frodon, c'est la récompense&#8239;: les dons de Galadriel, dont la fiole qui le sauvera plus tard. Deuil et cadeau dans le même chapitre&#8239;: c'est ce double fond qui fait sa force.</li>
  <li><strong>Chapitre 9.</strong> Boromir tente de prendre l'Anneau, Frodon et Sam traversent le fleuve seuls. Finale et scène finale d'un côté&#8239;; les trois étapes du Retour compressées de l'autre. Mais l'élixir n'est pas encore gagné&#8239;: le voyage de Frodon déborde du tome, et c'est ce qui donne envie d'ouvrir le suivant.</li>
</ul>
<p>Regarde aussi les décalages. Le chapitre 4 (Amon Sûl, la blessure du Roi-Sorcier) ne porte aucun beat, mais c'est l'étape des épreuves pour Frodon. Le chapitre 5 porte le milieu de l'intrigue sans étape pour Frodon&#8239;: c'est Gandalf, dont la démo trace aussi le voyage, qui y franchit son seuil. <strong>Un chapitre sans beat ni étape mérite une question. Un chapitre qui n'a de sens que pour une seule des deux méthodes te dit qui il sert vraiment.</strong></p>

<h2>🎯 Mini-quiz&#8239;: cinq questions pour trancher</h2>
<p>Note tes réponses, A ou B. Pas de bonne réponse, juste ta pente naturelle.</p>
<ol>
  <li><strong>Quand tu racontes ton histoire à un ami, tu commences par…</strong> A&#8239;: ce qui arrive («&#8239;un cambriolage tourne mal&#8239;»). B&#8239;: qui change («&#8239;une gamine timide apprend à se battre&#8239;»).</li>
  <li><strong>Ta plus grande peur pour novembre&#8239;?</strong> A&#8239;: un milieu qui s'enlise. B&#8239;: un héros qui finit comme il a commencé.</li>
  <li><strong>Combien de personnages portent le récit&#8239;?</strong> A&#8239;: un héros, une intrigue serrée. B&#8239;: plusieurs personnages qui doivent chacun évoluer.</li>
  <li><strong>Ta façon d'écrire&#8239;?</strong> A&#8239;: tu veux savoir où tu vas avant la première ligne. B&#8239;: tu découvres ton histoire en l'écrivant.</li>
  <li><strong>Ce que tu rêves d'entendre d'un lecteur&#8239;?</strong> A&#8239;: «&#8239;Impossible de le lâcher.&#8239;» B&#8239;: «&#8239;Je pense encore à ton personnage.&#8239;»</li>
</ol>
<ul>
  <li><strong>4 ou 5 A</strong>&#8239;: Save the Cat. Pose tes 15 beats et garde un œil sur l'arc de ton héros.</li>
  <li><strong>4 ou 5 B</strong>&#8239;: le Voyage du Héros. Trace le voyage de chaque personnage clé, puis vérifie que ton intrigue a un déclencheur, un milieu et une crise.</li>
  <li><strong>3 contre 2, dans un sens ou dans l'autre</strong>&#8239;: superpose. Une beat sheet pour le livre, un voyage pour ton protagoniste, et le chapitre comme pont entre les deux.</li>
</ul>

<h2>🛠️ Save the Cat et Voyage du Héros dans un même projet</h2>
<p>Dans <strong>Atlas Narratif</strong>, Save the Cat et le Voyage du Héros cohabitent dans le même projet, chacun dans sa vue.</p>
<ul>
  <li><strong>Côté Save the Cat</strong>, tu rattaches chaque beat à une scène de ta timeline. Atlas calcule où tombe cette scène et te signale un beat absent ou trop éloigné de sa position idéale. Sur une saga, chaque tome a sa propre frise et ses propres alertes.</li>
  <li><strong>Côté Voyage du Héros</strong>, tu choisis un personnage et tu notes, pour chacune des 12 étapes, le chapitre où elle se joue et la façon dont elle se manifeste. Un compteur suit chaque héros, et le filtre de tome montre son arc volume par volume.</li>
</ul>
<figure class="blog-figure">
  <img src="/blog/save-the-cat-frise.png" alt="La frise Save the Cat dans Atlas Narratif&#8239;: chaque beat posé sur un chapitre, comparé à sa position idéale, réparti sur les trois actes." loading="lazy" />
  <figcaption>Côté intrigue&#8239;: la frise montre où tombe chaque beat et s'il s'écarte de sa position idéale (démo LOTR).</figcaption>
</figure>
<figure class="blog-figure">
  <img src="/blog/voyage-du-heros.png" alt="La vue Voyage du Héros dans Atlas Narratif&#8239;: les 12 étapes d'un personnage réparties en trois phases, chacune notée avec son numéro de chapitre." loading="lazy" />
  <figcaption>Côté transformation&#8239;: la même saga relue à travers un seul personnage, chaque étape datée par son chapitre (démo LOTR).</figcaption>
</figure>
<p>Le pont entre les deux vues, c'est le <strong>numéro de chapitre</strong>. Atlas ne fusionne pas les deux méthodes&#8239;: c'est toi qui fais la lecture croisée, chapitre 7 d'un côté, chapitre 7 de l'autre. Et c'est très bien ainsi&#8239;: décider que la chute de Gandalf est aussi l'épreuve suprême de Frodon, c'est un choix d'auteur, pas un calcul.</p>

<h2>⚠️ Les erreurs qui coûtent un mois de novembre</h2>
<ul>
  <li><strong>Forcer chaque étape dans un beat.</strong> Si une case ne colle pas, c'est une information, pas une faute.</li>
  <li><strong>Changer de méthode en plein jet.</strong> Le 12 novembre, note tes doutes et continue&#8239;: tu restructureras en décembre.</li>
  <li><strong>Remplir 27 cases avant d'écrire une ligne.</strong> 15 beats plus 12 étapes par personnage&#8239;: si ta prep devient un formulaire, reviens au kit minimal.</li>
</ul>

<h2>✅ En résumé</h2>
<p>Save the Cat structure ce qui arrive et quand&#8239;; le Voyage du Héros structure ce que ton héros devient. Intrigue serrée ou âme d'architecte&#8239;: commence par les beats. Quête, initiation ou âme de jardinier&#8239;: commence par le voyage. Saga ou hésitation&#8239;: superpose, avec le chapitre comme pont.</p>
<p>Dans <strong>Atlas Narratif</strong>, les deux vues vivent dans le même projet&#8239;: pose tes beats, trace le voyage de chaque personnage, puis lis-les chapitre par chapitre. La démo du Seigneur des Anneaux se charge depuis l'accueil, sans compte. Gratuit, en français, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Superpose Save the Cat et le Voyage du Héros gratuitement avec Atlas Narratif.</a> Démo LOTR sans compte, prête avant le 1er novembre.</p>
`,
};

const amorcesPaiementsDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 290" role="img" aria-label="Une amorce en trois temps sur trois tomes du Seigneur des Anneaux. Au tome 1, Gandalf parle de la pitié de Bilbo. Au tome 2, Frodon épargne Sméagol, c'est le rappel. Au tome 3, au Mont Destin, Gollum emporte l'Anneau dans l'abîme, c'est le paiement." style="width:100%;height:auto">
    <line x1="40" y1="220" x2="680" y2="220" stroke="#ffffff" stroke-opacity="0.14"/>
    <line x1="253" y1="70" x2="253" y2="220" stroke="#ffffff" stroke-opacity="0.08"/>
    <line x1="467" y1="70" x2="467" y2="220" stroke="#ffffff" stroke-opacity="0.08"/>
    <path d="M 110,220 Q 250,120 370,220" fill="none" stroke="#5cae8e" stroke-width="2" stroke-opacity="0.8" stroke-dasharray="5 4"/>
    <path d="M 110,220 Q 360,20 610,220" fill="none" stroke="#cba15e" stroke-width="2.5"/>
    <circle cx="110" cy="220" r="6" fill="#5cae8e"/>
    <circle cx="370" cy="220" r="5" fill="#5cae8e" fill-opacity="0.7"/>
    <circle cx="610" cy="220" r="7" fill="#cba15e"/>
    <g font-family="'Spectral',Georgia,serif" fill="#ece7db" font-size="14" text-anchor="middle">
      <text x="110" y="246">L'amorce</text>
      <text x="370" y="246">Le rappel</text>
      <text x="610" y="246">Le paiement</text>
    </g>
    <g font-family="'Spectral',Georgia,serif" fill="#a9a291" font-size="12" text-anchor="middle">
      <text x="110" y="264">Gandalf et la pitié de Bilbo</text>
      <text x="370" y="264">Frodon épargne Sméagol</text>
      <text x="610" y="264">Gollum au Mont Destin</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" fill="#a9a291" font-size="11" text-anchor="middle">
      <text x="146" y="90">TOME 1</text>
      <text x="360" y="90">TOME 2</text>
      <text x="574" y="90">TOME 3</text>
    </g>
  </svg>
  <figcaption>Une amorce qui traverse toute la trilogie&#8239;: posée par une réplique, rappelée par un geste, payée au moment décisif.</figcaption>
</figure>`;

const amorcesPaiements = {
  slug: 'amorces-paiements-plant-payoff',
  pillar: 'P2',
  metaTitle: 'Plant and payoff : amorces et paiements dans ton roman',
  title: 'Amorces et paiements (plant & payoff) : l\'art de préparer ses révélations',
  description:
    'Plant and payoff en écriture : types d\'amorces, bon dosage, fausses pistes, amorces sur plusieurs tomes. Prépare des révélations qui frappent juste.',
  excerpt:
    'Une révélation réussie se prépare cent pages plus tôt. Objet, réplique, trait de caractère, info de monde : comment semer tes amorces et ne jamais en oublier une.',
  date: '2026-11-03',
  readingTime: '8 min',
  tags: ['Amorces', 'Plant & payoff', 'Révélations', 'Saga'],
  emoji: '🌱',
  html: `
<p>Tu connais ce moment. Tu relis ta grande scène de révélation, celle que tu as en tête depuis le début, et elle tombe à plat. Pas parce qu'elle est mal écrite, mais parce qu'elle sort de nulle part. Le lecteur ne sera pas surpris, il sera floué.</p>
<p>À l'inverse, tu te souviens sûrement d'un livre où une révélation t'a fait refermer le volume une seconde, le temps de te dire&#8239;: «&#8239;mais c'était là depuis le début&#8239;!&#8239;». Cette sensation a un nom dans le métier&#8239;: <strong>l'amorce et le paiement</strong>, ou <em>plant and payoff</em>. Ce n'est pas un don&#8239;: c'est une technique, et elle se travaille.</p>

<h2>🎯 Le fusil de Tchekhov, et ce qu'il ne dit pas</h2>
<p>La formule qu'on prête à Tchekhov est célèbre&#8239;: si un fusil est accroché au mur au premier acte, il doit tirer avant la fin. On la cite souvent comme une règle d'économie (ne montre rien d'inutile). Retourne-la, et elle devient bien plus utile pour toi&#8239;: <strong>si un fusil tire au dernier acte, il doit avoir été accroché au mur avant</strong>.</p>
<p>Une amorce, c'est une promesse faite au lecteur. Un paiement, c'est la promesse tenue. Entre les deux, il y a une tension que le lecteur ressent sans toujours la nommer. Une révélation sans amorce ressemble à de la triche&#8239;; une amorce sans paiement ressemble à un oubli. Les deux abîment la confiance&#8239;; on y revient dans notre guide pour <a href="/blog/detecter-incoherences-roman">détecter les incohérences de ton roman</a>.</p>

<h2>🧰 Les quatre grandes familles d'amorces</h2>
<p>On pense spontanément à l'objet, mais c'est loin d'être la seule façon de semer. Varier les familles, c'est ce qui empêche le lecteur de repérer ton jeu.</p>
<h3>L'objet</h3>
<p>Le plus classique, et le plus lisible. Au moment de quitter la Lórien, Galadriel offre à Frodon une fiole contenant la lumière d'Eärendil, «&#8239;une lumière pour les lieux obscurs&#8239;». Cadeau d'adieu, joli moment, on passe à la suite. Des centaines de pages plus tard, dans l'antre d'Arachne, c'est cette lumière qui repousse le monstre. L'objet était là, nommé, décrit, puis laissé en sommeil.</p>
<h3>La réplique</h3>
<p>Une phrase glissée dans un dialogue, qui prend tout son sens plus tard. Au début de <em>La Communauté de l'Anneau</em>, Frodon regrette que Bilbo n'ait pas tué Gollum quand il le pouvait. Gandalf répond, en substance, que la pitié de Bilbo pourrait bien décider du sort de beaucoup. Sur le moment, c'est une leçon morale. À la fin de la trilogie, c'est la clé du dénouement.</p>
<h3>Le trait de caractère</h3>
<p>Une faiblesse, une obsession, une valeur que tu installes tôt et qui dictera un choix décisif. Au Conseil d'Elrond, Boromir plaide pour utiliser l'Anneau contre l'ennemi. On l'entend comme un argument politique. Plus tard, à Amon Hen, ce même désir le pousse à tenter de prendre l'Anneau à Frodon. Sa chute n'est pas une surprise gratuite, elle est l'aboutissement de ce qu'on savait de lui.</p>
<h3>L'information de monde</h3>
<p>Une règle, une légende, un détail d'histoire qui semble relever du décor. C'est la famille reine en fantasy et en SF, parce qu'elle se fond dans le worldbuilding. Quand Gandalf explique ce que sont les palantíri, ces pierres de vision, c'est un point de lore. C'est aussi ce qui éclaire, un tome plus loin, le désespoir de Denethor&#8239;: l'Intendant regardait dans sa propre pierre, et n'y voyait que ce que Sauron voulait bien lui montrer. Si tu tiens une <a href="/blog/creer-bible-univers-worldbuilding">bible d'univers</a>, c'est une mine d'amorces qui dort.</p>

<h2>⚖️ Le dosage&#8239;: ni néon, ni aiguille dans une botte de foin</h2>
<p>Tout l'art est là. Une amorce trop visible, et le lecteur devine ta révélation cinquante pages à l'avance. Une amorce trop cachée, et ton paiement passe pour un <em>deus ex machina</em>. Quelques techniques pour trouver le bon réglage&#8239;:</p>
<ul>
  <li><strong>Noie l'amorce dans le mouvement.</strong> Place-la au cœur d'une scène qui capte l'attention ailleurs&#8239;: une dispute, un départ précipité, une scène drôle. Les cadeaux de Galadriel arrivent dans une scène d'adieux chargée d'émotion. La fiole est un cadeau parmi d'autres.</li>
  <li><strong>Donne-lui une fonction immédiate.</strong> Une amorce qui sert déjà à quelque chose dans sa scène (caractériser, faire sourire, installer une ambiance) ne ressemble pas à une amorce. Elle ressemble à du récit.</li>
  <li><strong>Rappelle-la au moins une fois.</strong> Entre la pose et le paiement, un rappel discret ravive la mémoire du lecteur sans rien trahir. C'est ce qui fait qu'au paiement, il se souvient au lieu de découvrir.</li>
  <li><strong>Ne la souligne jamais.</strong> Pas de gros plan appuyé, pas de personnage qui fixe l'objet d'un air songeur. Si la narration dit «&#8239;retiens bien ça&#8239;», le lecteur le retient, et il anticipe.</li>
</ul>
${amorcesPaiementsDiagram}

<h2>🎭 Amorce ou fausse piste&#8239;?</h2>
<p>La fausse piste (le <em>red herring</em>) est la cousine rusée de l'amorce. Elle aussi est semée avec soin, elle aussi appelle un paiement. La différence&#8239;: elle oriente le lecteur vers une conclusion que tu vas renverser.</p>
<p>Dans le premier <em>Harry Potter</em>, tout désigne Rogue&#8239;: son hostilité, ses regards, sa jambe blessée. Le coupable est Quirrell, le professeur bégayant que personne ne soupçonne. La fausse piste fonctionne parce que chaque indice contre Rogue reçoit, au final, une explication cohérente. Tolkien joue le même tour à Bree&#8239;: Sam se méfie de l'inquiétant Grands-Pas, et le rôdeur au visage sombre se révèle être l'héritier d'Isildur.</p>
<p>La règle d'or&#8239;: <strong>une fausse piste doit être payée aussi</strong>. Si tu laisses des indices trompeurs sans jamais les expliquer, le lecteur ne se sent pas joué avec élégance, il se sent manipulé. Et note-les dans ton registre au même titre que tes amorces&#8239;: c'est le meilleur moyen de ne pas «&#8239;corriger&#8239;» par erreur une ambiguïté voulue lors de ta relecture.</p>

<h2>📚 Amorces et paiements sur plusieurs tomes</h2>
<p>Sur une saga, l'écart entre la pose et le paiement peut se compter en années, pour toi comme pour ton lecteur. C'est là que naissent les effets les plus mémorables. Au tout premier chapitre de <em>Harry Potter à l'école des sorciers</em>, Hagrid arrive sur une moto volante qu'il dit avoir empruntée au jeune Sirius Black. Un nom en passant. Il faudra attendre le tome 3 pour que ce nom devienne celui du prisonnier évadé d'Azkaban.</p>
<p>Chez Tolkien, la pitié de Bilbo pour Gollum en est l'exemple parfait. Posée par une réplique de Gandalf au tome 1, rappelée au tome 2 quand Frodon, à son tour, épargne Sméagol, elle ne se paie qu'au Mont Destin&#8239;: c'est parce que Gollum est encore en vie que l'Anneau finit dans l'abîme, quand Frodon lui-même, au bord du gouffre, refuse de le jeter. On a détaillé cette architecture dans notre analyse de <a href="/blog/structure-seigneur-des-anneaux">la structure du Seigneur des Anneaux</a>.</p>
<p>Le revers de la médaille&#8239;: plus l'écart est long, plus le risque d'oubli grimpe. Une amorce du tome 1 que tu as perdue de vue au tome 3, ton lecteur, lui, l'a peut-être relue la veille. Pour la méthode globale sur plusieurs volumes, voir aussi notre guide pour <a href="/blog/gerer-plusieurs-tomes-saga">gérer plusieurs tomes sans perdre le fil</a>.</p>

<h2>📒 Tenir un registre d'amorces</h2>
<p>Chaque amorce est une dette narrative. Et comme toute dette, elle se note. Un registre d'amorces n'a pas besoin d'être compliqué, mais il doit répondre à quelques questions pour chaque promesse&#8239;:</p>
<ol>
  <li><strong>Quoi&#8239;?</strong> Une phrase qui résume la promesse, pas la scène.</li>
  <li><strong>De quelle famille&#8239;?</strong> Objet, réplique, trait, info de monde, ou fausse piste.</li>
  <li><strong>Où est-elle posée&#8239;?</strong> Le tome et le chapitre.</li>
  <li><strong>Où sera-t-elle payée&#8239;?</strong> Même si c'est «&#8239;pas encore décidé&#8239;».</li>
  <li><strong>Où en est-elle&#8239;?</strong> En suspens, payée, ou abandonnée en connaissance de cause.</li>
</ol>
<p>Ce dernier point compte plus qu'il n'y paraît. Abandonner une amorce est un choix légitime (le récit a changé, la piste ne mène plus nulle part). Ce qui ne l'est pas, c'est de l'oublier. Un statut «&#8239;abandonnée&#8239;» te rappelle d'aller retirer ou adoucir la pose dans le texte.</p>
<p>Le tracker d'amorces d'<strong>Atlas Narratif</strong> reprend ces questions une à une. Chaque amorce y porte un type (objet, personnage, information, dialogue, thème), son chapitre et son tome de pose, son chapitre et son tome de paiement, et un statut&#8239;: en suspens, résolue ou abandonnée. Tu peux la relier au personnage ou à l'objet concerné et y noter ton intention. Une vue en arcs trace chaque promesse du chapitre où tu la poses à celui où tu la paies&#8239;: les arcs encore en pointillé attendent leur paiement, et ceux qui enjambent plusieurs tomes ressortent en or.</p>
<figure class="blog-figure">
  <img src="/blog/amorces-paiements.png" alt="Le tracker d'amorces et paiements d'Atlas Narratif&#8239;: chaque promesse reliée du tome où elle est posée à celui où elle est résolue, avec son statut." loading="lazy" />
  <figcaption>Chaque amorce suivie de sa mise en place à son paiement, d'un tome à l'autre (démo LOTR).</figcaption>
</figure>
<p>Et avant de boucler un tome, le filtre «&#8239;En suspens&#8239;» isole en un clic toutes les promesses qui attendent encore leur paiement. Le détecteur d'incohérences, lui, signale les amorces restées ouvertes et les paiements placés, par erreur, avant leur amorce.</p>
<p>Dans la démo du Seigneur des Anneaux, il n'en reste qu'une&#8239;: les Ents femelles, que Sylvebarbe demande aux hobbits de chercher et que Tolkien ne retrouve jamais. Une amorce ouverte n'est pas forcément une faute, à condition qu'elle soit un choix et pas un oubli.</p>
<figure class="blog-figure">
  <img src="/blog/amorces-ouvertes.png" alt="Le tracker d'amorces d'Atlas Narratif filtré sur les amorces en suspens&#8239;: une seule reste ouverte, les Ents femelles, posée au chapitre 12 du tome 2 et jamais payée." loading="lazy" />
  <figcaption>Le filtre «&#8239;En suspens&#8239;»&#8239;: les Ents femelles, la promesse que Tolkien laisse ouverte (démo LOTR).</figcaption>
</figure>

<h2>⚠️ Les erreurs classiques</h2>
<ul>
  <li><strong>Semer après coup sans relire la suite.</strong> Ajouter une amorce en réécriture est une excellente pratique. L'ajouter au chapitre 2 mais la contredire au chapitre 5, qui date de la première version, l'est beaucoup moins. Relis le chemin entre la pose et le paiement.</li>
  <li><strong>Le paiement trop proche.</strong> Une amorce payée trois pages plus loin n'est pas une amorce, c'est une explication. Laisse le temps à l'oubli de faire son œuvre.</li>
  <li><strong>Le paiement qui ne paie pas.</strong> L'objet ressort, mais il ne change rien. Un vrai paiement fait basculer une scène, une décision, un destin.</li>
  <li><strong>Tout amorcer.</strong> Si chaque détail est une promesse, plus rien ne l'est. Une part de ton décor doit rester du décor.</li>
  <li><strong>Garder le registre dans ta tête.</strong> Elle tient un roman. Elle ne tient pas une saga.</li>
</ul>

<h2>🧭 En résumé</h2>
<p>Une révélation réussie se prépare longtemps à l'avance. Pose ton amorce en variant les familles (objet, réplique, trait de caractère, info de monde), dose-la pour qu'elle passe inaperçue sans être invisible, rappelle-la au moins une fois, et paie-la au moment où elle change tout. Traite tes fausses pistes avec la même rigueur, et tiens un registre dès que ton histoire dépasse un seul volume.</p>
<p><strong>Atlas Narratif</strong> garde tes promesses sous tes yeux&#8239;: un tracker d'amorces par type, chapitre et tome, une vue en arcs qui montre ce qui reste en suspens, et un détecteur qui te signale les oublis. Gratuit, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Explore le tracker d'amorces sur la démo du Seigneur des Anneaux, sans créer de compte.</a> Puis sème les tiennes.</p>
`,
};

const syndromeDuTome2Diagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 300" role="img" aria-label="Courbe de tension d'une trilogie. Au tome 2, une courbe dorée en pointillé reste plate, tandis qu'une courbe verte monte vers un climax propre au tome puis s'achève sur une fin qui renverse, haut placée et non résolue." style="width:100%;height:auto">
    <!-- axe et séparateurs de tomes -->
    <line x1="60" y1="240" x2="680" y2="240" stroke="#ffffff" stroke-opacity="0.14"/>
    <line x1="266" y1="60" x2="266" y2="240" stroke="#ffffff" stroke-opacity="0.1"/>
    <line x1="473" y1="60" x2="473" y2="240" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="48" y="150" font-family="ui-monospace,Menlo,monospace" font-size="11" fill="#a9a291" text-anchor="middle" transform="rotate(-90 48 150)">tension</text>
    <!-- tome 1 et tome 3, communs -->
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="60,215 100,182 150,170 200,150 235,108 250,122 266,165"/>
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="473,100 500,132 540,112 580,92 620,62 645,42 665,80 680,96"/>
    <!-- tome 2 pont : surplace -->
    <polyline fill="none" stroke="#cba15e" stroke-width="2.5" stroke-dasharray="6 5" stroke-linejoin="round" stroke-linecap="round"
      points="266,165 300,158 340,163 380,156 420,161 473,157"/>
    <!-- tome 2 avec son propre arc -->
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="266,165 292,178 322,142 352,152 382,116 412,132 440,72 456,86 473,100"/>
    <!-- repères -->
    <g stroke="#ffffff" stroke-opacity="0.14">
      <line x1="440" y1="68" x2="405" y2="56"/>
      <line x1="475" y1="104" x2="480" y2="186"/>
    </g>
    <circle cx="440" cy="72" r="4" fill="#cba15e"/>
    <circle cx="473" cy="100" r="4" fill="#cba15e"/>
    <g font-family="'Spectral',Georgia,serif" font-size="12.5" fill="#ece7db">
      <text x="400" y="52" text-anchor="end">climax propre au tome 2</text>
      <text x="484" y="200">fin qui renverse</text>
    </g>
    <text x="370" y="190" font-family="'Spectral',Georgia,serif" font-size="12.5" fill="#cba15e" text-anchor="middle">surplace</text>
    <g font-family="'Spectral',Georgia,serif" fill="#ece7db" font-size="15" text-anchor="middle">
      <text x="163" y="268">TOME 1</text>
      <text x="369" y="268">TOME 2</text>
      <text x="576" y="268">TOME 3</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11.5">
      <rect x="90" y="20" width="12" height="12" rx="3" fill="#cba15e"/>
      <text x="110" y="30" fill="#a9a291">tome 2 pont, qui fait du surplace</text>
      <rect x="410" y="20" width="12" height="12" rx="3" fill="#5cae8e"/>
      <text x="430" y="30" fill="#a9a291">tome 2 avec son propre arc</text>
    </g>
  </svg>
  <figcaption>Deux tomes 2 possibles pour la même trilogie. Le premier fait patienter, le second raconte sa propre histoire et relance la suite par une fin qui renverse.</figcaption>
</figure>`;

const syndromeDuTome2 = {
  slug: 'syndrome-du-tome-2',
  pillar: 'P3',
  metaTitle: 'Syndrome du tome 2 : écrire un tome 2 qui tient',
  title: 'Syndrome du tome 2 : pourquoi ta suite s\'enlise (et comment l\'éviter)',
  description:
    'Ton tome 2 fait du surplace ? Les causes du syndrome du tome 2 et les remèdes pour écrire un tome 2 qui a son propre arc, exemples à l\'appui.',
  excerpt:
    'Un tome 2 qui rejoue le premier, qui fait patienter, qui n\'a pas d\'arc à lui : les cinq causes du syndrome, et comment Les Deux Tours y échappe.',
  date: '2026-11-17',
  readingTime: '9 min',
  tags: ['Saga', 'Tome 2', 'Structure', 'Arc émotionnel'],
  emoji: '🌀',
  html: `
<p>Ton tome 1 est fini. Il a une ouverture qui accroche, un climax dont tu es fier, peut-être même quelques lecteurs qui réclament la suite. Tu attaques le tome 2 avec l'élan du vainqueur… et au chapitre 8, quelque chose coince. Tes personnages voyagent, discutent, se préparent. Il se passe des choses, mais rien ne <em>bouge</em>. Tu relis et une question te glace&#8239;: est-ce que ce tome sert à autre chose qu'à attendre le tome 3&#8239;?</p>
<p>Bienvenue dans le syndrome du tome 2. Il touche les débutants comme les auteurs confirmés, et ses causes sont précises. Bonne nouvelle&#8239;: ce qui se diagnostique se soigne.</p>

<h2>🌀 Le syndrome du tome 2, c'est quoi&#8239;?</h2>
<p>Les anglophones parlent de <em>middle book syndrome</em>&#8239;: le livre du milieu qui s'affaisse entre un début éclatant et une fin attendue. On le reconnaît à trois symptômes.</p>
<ul>
  <li><strong>Le surplace.</strong> Beaucoup d'allers-retours, de conseils de guerre, de trajets. L'action remplit les pages sans changer la situation.</li>
  <li><strong>La redite.</strong> Le tome rejoue la partition du premier&#8239;: même menace, même type d'épreuve, même climax, un cran plus fort. Le lecteur a une impression de déjà-lu.</li>
  <li><strong>Le pont.</strong> Le tome n'existe que pour amener les pièces en place avant le final. Il ne commence rien et ne termine rien.</li>
</ul>
<p>Le point commun&#8239;? Un tome 2 malade est un tome qui ne raconte pas <em>sa</em> histoire. Il raconte la transition entre deux autres.</p>

<h2>🔍 Les cinq causes d'un tome 2 qui s'enlise</h2>
<h3>1. Pas d'arc propre au tome</h3>
<p>C'est la cause mère. Le tome 2 poursuit le grand arc de la saga, mais n'a ni question à lui, ni climax à lui, ni résolution à lui. Si tu ne peux pas résumer ton tome 2 en une phrase du type «&#8239;dans ce tome, X veut Y, et à la fin il l'obtient ou le perd&#8239;», tu tiens probablement le coupable.</p>
<h3>2. Des enjeux qui n'escaladent pas</h3>
<p>Au tome 1, ton héros a risqué sa vie. Au tome 2, il la risque… encore. Même intensité, même nature d'enjeu. Or le lecteur s'habitue vite&#8239;: un danger répété s'use. Escalader, ce n'est pas seulement grossir l'armée d'en face&#8239;; c'est élargir (un royaume au lieu d'un village) ou approfondir (ce qui est menacé devient intime).</p>
<h3>3. Des personnages figés</h3>
<p>Le tome 1 a transformé ton héros. Puis, au tome 2, il reste tel quel, comme si son arc était bouclé et qu'il ne restait plus qu'à le déplacer sur la carte. Un personnage qui ne change plus devient un pion. Le tome du milieu est justement le moment où il doit douter, rechuter, payer le prix de ce qu'il est devenu.</p>
<h3>4. Les amorces du tome 1 oubliées</h3>
<p>Ton premier tome a semé des promesses&#8239;: un personnage inquiétant à peine entrevu, un objet mis en avant, une prophétie. Si le tome 2 les ignore pour inventer de nouveaux ressorts, le lecteur a la sensation que la saga repart de zéro. À l'inverse, payer une amorce du tome 1 au tome 2, c'est prouver que tout était pensé. On détaille la mécanique dans notre article sur <a href="/blog/amorces-paiements-plant-payoff">les amorces et paiements</a>.</p>
<h3>5. Des rappels pesants</h3>
<p>Le lecteur a peut-être lu le tome 1 il y a deux ans. Alors tu recaps&#8239;: trois pages sur la bataille précédente, un dialogue où deux personnages se racontent ce qu'ils savent déjà. Résultat, le tome démarre à l'arrêt. Le rappel utile est bref, glissé dans l'action, et répond à une question que la scène pose maintenant.</p>
${syndromeDuTome2Diagram}

<h2>🎬 Quatre tomes du milieu qui ont réussi</h2>
<h3><em>Les Deux Tours</em>&#8239;: la communauté dispersée</h3>
<p>Tolkien part d'une rupture&#8239;: la Communauté est brisée, et le tome se construit en deux moitiés distinctes, d'un côté Aragorn, Legolas, Gimli, Merry et Pippin, de l'autre Frodon et Sam. Chaque moitié a son propre mouvement. Le Rohan se réveille, Théoden passe du roi envoûté par Grima au roi qui mène la charge, et cette ligne culmine au Gouffre de Helm. Côté Mordor, Gollum, raconté par Gandalf et à peine entrevu dans la Moria au tome 1, devient le guide de Frodon&#8239;: une amorce du premier tome qui porte ses premiers fruits au deuxième, avant son vrai paiement au Mont Destin. Et le thème s'approfondit&#8239;: Faramir refuse l'Anneau là où Boromir a cédé, Gollum montre à Frodon ce qu'il pourrait devenir. Surtout, le livre se clôt sur une fin qui renverse&#8239;: Frodon vivant mais aux mains de l'Ennemi, Sam seul avec l'Anneau. La victoire de Helm ne vaut rien si la quête échoue.</p>
<h3><em>L'Empire contre-attaque</em>&#8239;: la défaite comme arc</h3>
<p>Le cas d'école du cinéma. Le film ne rejoue pas <em>Un nouvel espoir</em>, il le prend à rebours&#8239;: les rebelles fuient au lieu de gagner. Luke a un arc complet, de l'apprentissage chez Yoda à la confrontation avec Vador, qu'il perd. Il y laisse une main, apprend que Vador est son père, et Han finit dans la carbonite. Les enjeux ont changé de nature&#8239;: on ne se bat plus seulement contre l'Empire, mais contre la tentation et sa propre filiation.</p>
<h3><em>Harry Potter</em>&#8239;: le tome 2 contre le tome 3</h3>
<p>La comparaison est instructive. <em>La Chambre des secrets</em> passe souvent pour le tome le plus proche du premier&#8239;: rentrée à Poudlard, mystère au château, affrontement final avec une incarnation de Voldemort. La mécanique fonctionne, mais elle rejoue. <em>Le Prisonnier d'Azkaban</em> casse le moule&#8239;: pas de Voldemort, une menace qui n'en est pas une, le passé des parents de Harry qui remonte, et une fin sans victoire nette, puisque Pettigrow s'échappe et que Sirius doit fuir. Le tome 3 approfondit au lieu de répéter, et c'est celui que beaucoup de lecteurs citent comme le tournant de la saga.</p>
<h3><em>Hunger Games&#8239;: L'Embrasement</em>&#8239;: rejouer pour mieux renverser</h3>
<p>Suzanne Collins prend le risque maximal&#8239;: renvoyer Katniss dans l'arène. Sur le papier, c'est la redite absolue. En pratique, tout est retourné&#8239;: l'arène n'est plus un jeu de survie mais un piège politique, les alliances comptent plus que les victoires, et le tome se termine sur un double choc, le District 12 rasé et Peeta aux mains du Capitole. Rejouer le tome 1, oui, mais pour mieux en inverser le sens.</p>

<h2>🛠️ Cinq remèdes pour écrire un tome 2 qui tient</h2>
<ol>
  <li><strong>Donne-lui un arc complet.</strong> Une question propre au tome, posée tôt, qui trouve sa réponse au climax. Pose ce tome sur une structure comme <a href="/blog/la-methode-save-the-cat-15-beats">les 15 beats de Save the Cat</a>&#8239;: s'il n'a ni catalyseur, ni midpoint, ni «&#8239;tout est perdu&#8239;», c'est qu'il n'a pas d'histoire à lui.</li>
  <li><strong>Fais escalader d'un cran, dans une nouvelle direction.</strong> Plus large (le conflit gagne des peuples entiers), plus profond (l'enjeu devient personnel), ou plus ambigu (l'ennemi n'est plus seulement dehors). Évite simplement «&#8239;plus gros&#8239;».</li>
  <li><strong>Soigne une fin qui renverse.</strong> Le tome du milieu est l'endroit idéal pour la fin sombre&#8239;: une victoire payée trop cher, une révélation qui change la lecture du tome 1, un héros qui échoue. Elle doit clore l'arc du tome tout en rouvrant la question du grand arc.</li>
  <li><strong>Approfondis le thème au lieu de le répéter.</strong> Si ton tome 1 disait «&#8239;le courage paie&#8239;», le tome 2 peut demander «&#8239;et à quel prix&#8239;?&#8239;». Un personnage miroir, comme Gollum pour Frodon, est un excellent outil pour ça.</li>
  <li><strong>Paie des amorces du tome 1, sème celles du tome 3.</strong> Et dose tes rappels&#8239;: une phrase au bon moment vaut mieux qu'un chapitre de résumé.</li>
</ol>
<p>Pour l'architecture d'ensemble d'une série (grand arc, arcs de tome, cohérence sur la durée), on a un guide dédié&#8239;: <a href="/blog/gerer-plusieurs-tomes-saga">comment gérer plusieurs tomes sans perdre le fil</a>. Ici, retiens surtout que le tome du milieu doit mériter sa place à lui seul.</p>

<h2>📈 Regarde la courbe de ton tome 2 à part</h2>
<p>Un tome 2 qui fait du surplace se voit souvent mieux qu'il ne se lit. Note l'intensité dramatique de chaque chapitre sur 10, trace la courbe, et regarde-la <strong>isolée du reste de la saga</strong>. Noyée dans la trilogie, une longue plaine passe inaperçue. Seule, elle saute aux yeux.</p>
<p>La vue Arc émotionnel d'Atlas Narratif est faite pour ça. Tu choisis le tome 2 dans le sélecteur de tomes, et la courbe ne montre plus que ses chapitres, avec l'intensité moyenne du tome. Dans la démo, <em>Les Deux Tours</em> dessine un vrai arc&#8239;: un départ dans le creux (Emyn Muil, les Marais des Morts), un sursaut au retour de Gandalf le Blanc, puis le sommet de la nuit au Gouffre de Helm, dans le dernier tiers. Sous la courbe, des constats de craft te signalent un «&#8239;ventre mou&#8239;», une «&#8239;courbe plate&#8239;» ou un climax mal placé&#8239;: les symptômes du syndrome, chapitre par chapitre.</p>
<figure class="blog-figure">
  <img src="/blog/arc-emotionnel-tome-2.png" alt="La vue Arc émotionnel d'Atlas Narratif filtrée sur le tome 2, Les Deux Tours&#8239;: la courbe de tension chapitre par chapitre, du creux des Marais des Morts au pic du Gouffre de Helm." loading="lazy" />
  <figcaption>La courbe de tension des <em>Deux Tours</em> seule, chapitre par chapitre&#8239;: un tome qui a son propre climax (démo LOTR).</figcaption>
</figure>

<h2>✅ En résumé</h2>
<p>Le syndrome du tome 2 n'est pas une fatalité, c'est un diagnostic. Un tome du milieu s'enlise quand il n'a pas d'arc à lui, que ses enjeux stagnent, que ses personnages se figent, qu'il oublie les promesses du tome 1 ou qu'il s'étouffe sous les rappels. Il décolle quand il raconte sa propre histoire, escalade dans une direction neuve, approfondit le thème et s'achève sur une fin qui renverse. <em>Les Deux Tours</em>, <em>L'Empire contre-attaque</em> ou <em>L'Embrasement</em> le prouvent&#8239;: le tome du milieu peut être le meilleur de la série.</p>
<p><strong>Atlas Narratif</strong> t'aide à le vérifier&#8239;: filtre ta saga par tome, trace la courbe de tension de ton tome 2 seul, pose-le sur Save the Cat et suis tes amorces d'un volume à l'autre. Gratuit, en français, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Examine la courbe de ton tome 2 avec Atlas Narratif.</a> Charge la démo du Seigneur des Anneaux depuis l'accueil, sans compte, et filtre sur <em>Les Deux Tours</em>.</p>
`,
};

const bibleUniversIcebergDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 340" role="img" aria-label="Un iceberg coupé par la surface du texte : la pointe visible est ce que lit ton lecteur, la masse immergée est ta bible, et un contour en pointillé plus profond figure le puits sans fond du worldbuilding qui ne servira jamais." style="width:100%;height:auto">
    <line x1="30" y1="110" x2="470" y2="110" stroke="#5cae8e" stroke-opacity="0.6" stroke-width="2" stroke-dasharray="8 6"/>
    <text x="30" y="100" font-family="ui-monospace,Menlo,monospace" font-size="11" fill="#a9a291">SURFACE DU TEXTE</text>
    <polygon points="130,160 90,250 160,322 400,322 450,240 400,170" fill="none" stroke="#cba15e" stroke-width="1.5" stroke-dasharray="5 5" stroke-opacity="0.8"/>
    <polygon points="200,110 330,110 400,170 370,240 260,258 150,222 130,160" fill="#5cae8e" fill-opacity="0.25" stroke="#5cae8e" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="200,110 240,50 265,72 290,38 330,110" fill="#ece7db" fill-opacity="0.9" stroke="#ece7db" stroke-linejoin="round"/>
    <g font-family="'Spectral',Georgia,serif" font-size="16" font-weight="600">
      <text x="490" y="62" fill="#ece7db">Ce que lit ton lecteur</text>
      <text x="490" y="182" fill="#5cae8e">Ta bible</text>
      <text x="490" y="294" fill="#cba15e">Le puits sans fond</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11" fill="#a9a291">
      <text x="490" y="82">scènes, dialogues, détails</text>
      <text x="490" y="202">règles, lieux, dates, langues</text>
      <text x="490" y="314">ce qui ne servira jamais</text>
    </g>
  </svg>
  <figcaption>Le lecteur ne voit que la pointe. Ta bible la porte et lui donne sa densité&#8239;; en dessous, le worldbuilding infini ne sert plus ton histoire.</figcaption>
</figure>`;

const bibleUnivers = {
  slug: 'creer-bible-univers-worldbuilding',
  pillar: 'P1',
  metaTitle: 'Bible d\'univers : créer celle de ta saga (worldbuilding)',
  title: 'Comment créer une bible d\'univers pour ta saga (worldbuilding)',
  description:
    'Créer une bible d\'univers pour ton roman : personnages, lieux, factions, règles du monde, le piège de l\'iceberg et la méthode pas-à-pas pour une saga.',
  excerpt:
    'Ta magie coûtait du sang ou du sommeil, déjà ? Ce qu\'on met dans une bible d\'univers, comment éviter le worldbuilding infini, et la méthode pour la tenir sur toute une saga.',
  date: '2026-12-01',
  readingTime: '9 min',
  tags: ['Worldbuilding', 'Bible', 'Saga', 'Méthode'],
  emoji: '📖',
  html: `
<p>Tu reprends ton tome 2 après six mois de pause. Au chapitre 3, ton héroïne lance un sort. Et là, le doute&#8239;: dans le tome 1, la magie lui coûtait du sang ou du sommeil&#8239;? Combien de jours de cheval entre la capitale et le port&#8239;? Et le frère du roi, il s'appelait Aldric ou Aldwin&#8239;? Tu fouilles le manuscrit, et ta matinée y passe.</p>
<p>Ce qui te manque porte un nom&#8239;: une <strong>bible d'univers</strong>. Pas un second roman à écrire à côté du tien, mais un document de référence où ton monde tient debout tout seul. Voici comment en bâtir une qui serve vraiment, sans tomber dans le piège du worldbuilding sans fin.</p>

<h2>📖 Une bible d'univers, c'est quoi&#8239;?</h2>
<p>Le mot vient de la télévision. Dans une série, la <strong>bible</strong> est le document qu'on remet à chaque scénariste qui rejoint l'équipe&#8239;: les personnages et leur passé, les lieux récurrents, le ton, et surtout ce qui ne doit jamais arriver. Dix auteurs écrivent, et le public doit croire qu'une seule main tient l'ensemble.</p>
<p>En roman, tu es souvent seul, mais le problème est le même avec un décalage dans le temps&#8239;: l'auteur qui écrit le tome 3 n'est plus celui qui a écrit le tome 1. Il a oublié, changé d'avis, mûri. La bible, c'est la mémoire que ton «&#8239;toi&#8239;» d'hier transmet à ton «&#8239;toi&#8239;» de demain.</p>
<p>Tolkien en est l'exemple extrême. Les appendices du <em>Seigneur des Anneaux</em> réunissent les annales des rois, la chronologie des Âges, des arbres généalogiques, les calendriers, des notes sur l'écriture et la prononciation des langues. Une bible publiée en fin de volume. Et Tolkien expliquait lui-même avoir inventé ses histoires pour donner un monde à ses langues, plutôt que l'inverse.</p>

<h2>🧱 Ce que tu mets dans ta bible</h2>
<p>Une bible solide s'organise en cinq tiroirs. Inutile de tous les remplir le premier jour&#8239;: l'important est de savoir où ranger chaque chose quand elle apparaît.</p>
<h3>Les personnages</h3>
<p>Identité, alias, origine, traits, ce qu'ils veulent, ce qu'ils cachent. Ajoute les détails qu'on oublie le plus vite&#8239;: âge, couleur des yeux, cicatrices, taille. Frodon a cinquante ans quand il quitte la Comté&#8239;: c'est exactement le genre de chiffre qui doit être écrit quelque part, pas flotter dans ta tête.</p>
<h3>Les lieux</h3>
<p>Type de lieu, régime politique, habitants, endroits clés, et surtout les <strong>distances</strong>. Un lieu sans distance, c'est un voyage qui prendra trois jours à l'aller et une semaine au retour.</p>
<h3>Les objets</h3>
<p>Qui l'a créé, qui le détient, ce qu'il fait, dans quel état il se trouve. L'Anneau Unique tient en une fiche courte et redoutable&#8239;: forgé par Sauron, il rend invisible, prolonge la vie sans la rendre éternelle, corrompt son porteur et attire l'Œil. Quatre lignes, et toute l'intrigue en découle.</p>
<h3>Les groupes et factions</h3>
<p>Peuples, ordres, maisons nobles, guildes, religions. Un groupe a une identité, un territoire, des membres. La Communauté de l'Anneau est une faction de neuf compagnons&#8239;; les Istari, un ordre de magiciens&#8239;; les Hobbits, un peuple rattaché à la Comté. C'est souvent au croisement de deux appartenances que naissent les loyautés contradictoires.</p>
<h3>Les règles du monde</h3>
<p>C'est le tiroir le plus précieux, et le plus négligé. Il contient tout ce qui fait fonctionner ton monde&#8239;:</p>
<ul>
  <li><strong>La magie ou la technologie</strong>&#8239;: ce qu'elle permet, ce qu'elle coûte, ce qu'elle ne peut pas faire.</li>
  <li><strong>Le calendrier</strong>&#8239;: comment on compte les jours, les saisons, les années. Celui de la Comté aligne douze mois de trente jours, plus quelques jours de fête hors des mois.</li>
  <li><strong>Les langues</strong>&#8239;: qui parle quoi, comment chaque peuple nomme les choses. Le quenya et le sindarin n'ont pas les mêmes locuteurs, et un nom elfique ne se forge pas au hasard.</li>
  <li><strong>L'histoire</strong>&#8239;: les grands événements d'avant le roman, ceux qui pèsent encore sur le présent.</li>
</ul>

<h2>🧊 Le piège de l'iceberg</h2>
<p>C'est le danger qui guette tout amoureux du worldbuilding&#8239;: construire indéfiniment au lieu d'écrire. Trois ans de généalogies et de grammaire elfique, et pas un chapitre. Les anglophones ont même un nom pour ça&#8239;: la <em>worldbuilder's disease</em>, la maladie du bâtisseur de mondes.</p>
<p>La bonne image, c'est l'iceberg. Ton lecteur ne voit que la pointe&#8239;: une scène, un dialogue, un nom glissé au détour d'une phrase. Sous la surface, ta bible porte cette pointe et lui donne sa densité. Mais sous la bible s'ouvre un puits sans fond&#8239;: tout ce que tu pourrais inventer et qui ne servira jamais.</p>
${bibleUniversIcebergDiagram}
<p>Quand Aragorn chante le lai de Beren et Lúthien près de Montauvent, Tolkien ne raconte pas toute l'histoire&#8239;: il en montre un fragment, et le lecteur sent qu'un monde immense existe derrière. C'est ça, la profondeur. Pas tout dire, mais laisser deviner qu'on pourrait.</p>
<p>Le test est simple. Avant de développer un élément, demande-toi&#8239;: <strong>est-ce que ça change une scène&#8239;?</strong> Si non, note l'idée en une ligne et passe à la suite&#8239;: tu la creuseras quand une scène en aura besoin.</p>

<h2>⚖️ Des règles qui tiennent sur la durée</h2>
<p>Une règle de ton monde est une promesse faite au lecteur. S'il a compris que la magie coûte cher, il tremble quand ton héros s'en sert. Si la règle plie dès que l'intrigue coince, il décroche. Brandon Sanderson l'a formulé dans ses «&#8239;lois de la magie&#8239;»&#8239;: plus le lecteur comprend un système, plus tu peux t'en servir pour dénouer un conflit, et <strong>les limites sont plus intéressantes que les pouvoirs</strong>.</p>
<p>Pour chaque règle, écris quatre choses&#8239;:</p>
<ol>
  <li><strong>Ce qu'elle permet.</strong> L'Anneau rend invisible.</li>
  <li><strong>Ce qu'elle coûte.</strong> Il ronge celui qui le porte, un peu plus à chaque usage.</li>
  <li><strong>Ce qu'elle ne peut pas faire.</strong> Il ne peut être détruit que dans les feux où il a été forgé.</li>
  <li><strong>Qui la connaît.</strong> Au début du récit, presque personne ne sait ce qu'il est vraiment. Ce savoir est lui-même une information à suivre.</li>
</ol>
<p>Formulée ainsi, une règle devient vérifiable. Au moindre doute, tu relis la fiche au lieu de te fier à ta mémoire. C'est la première ligne de défense contre les failles d'univers, celles que recense notre <a href="/blog/detecter-incoherences-roman">checklist des incohérences</a>.</p>

<h2>🌱 Bible vivante ou bible figée&#8239;?</h2>
<p>Il y a deux écoles. La bible <strong>figée</strong> est écrite avant le premier chapitre, complète, et on n'y touche plus. Elle rassure, mais elle ment dès que ton histoire te surprend, ce qui arrive toujours. La bible <strong>vivante</strong> grandit avec le manuscrit&#8239;: chaque détail inventé en cours d'écriture rejoint sa fiche.</p>
<p>La bonne réponse tient des deux&#8239;: un <strong>socle figé</strong> (les règles fondamentales, celles qui ne bougent pas sans conséquence) et une <strong>couche vivante</strong> pour tout le reste. Si tu décides de toucher au socle, ce n'est plus une retouche&#8239;: c'est une réécriture, et il faut repasser sur chaque scène qui s'appuie sur la règle.</p>
<p>Le réflexe qui change tout&#8239;: <strong>une invention, une ligne</strong>. Tu baptises une auberge au chapitre 12&#8239;? Elle entre dans la bible avant la fin de la séance. Deux minutes maintenant, deux heures gagnées au tome suivant.</p>

<h2>📚 Une bible pour plusieurs tomes</h2>
<p>Sur une saga, la bible change de nature. Elle ne décrit plus seulement ton monde&#8239;: elle doit aussi dire <strong>ce que le lecteur en sait, et depuis quand</strong>. Un secret révélé au tome 2 ne peut plus être traité comme un mystère au tome 3.</p>
<ul>
  <li><strong>Date chaque révélation.</strong> Note le tome et le chapitre où une vérité sur ton monde est dévoilée.</li>
  <li><strong>Fais vieillir ton monde.</strong> Les personnages prennent des années, les alliances bougent, des lieux tombent ou se relèvent. Ta bible doit refléter l'état du monde à chaque tome.</li>
  <li><strong>Relie les éléments aux promesses.</strong> Une lame, une prophétie, une langue oubliée posées au tome 1 sont souvent des <a href="/blog/amorces-paiements-plant-payoff">amorces qui attendent leur paiement</a>.</li>
</ul>
<p>Pour l'architecture d'ensemble d'une série, grand arc et arc de chaque tome, on en parle dans <a href="/blog/gerer-plusieurs-tomes-saga">comment gérer plusieurs tomes sans perdre le fil</a>.</p>

<h2>🪜 Construire ta bible pas-à-pas</h2>
<ol>
  <li><strong>Pars du manuscrit, pas du vide.</strong> Liste les personnages, lieux et objets déjà nommés dans tes pages&#8239;: c'est ta bible minimale.</li>
  <li><strong>Remplis les fiches personnages</strong>, détails physiques compris.</li>
  <li><strong>Range-les dans des groupes.</strong> Les appartenances révèlent les conflits.</li>
  <li><strong>Écris tes règles en quatre lignes.</strong> Permet, coûte, interdit, qui sait.</li>
  <li><strong>Crée tes propres catégories.</strong> Sortilèges, dieux, navires&#8239;: ce que ton genre exige et qu'aucun modèle ne prévoit.</li>
  <li><strong>Tisse les liens.</strong> Qui porte quoi, qui vient d'où, qui parle quelle langue.</li>
  <li><strong>Applique le test de l'iceberg</strong>, puis mets ta bible à jour à chaque séance.</li>
</ol>

<h2>🛠️ Ta bible dans Atlas Narratif</h2>
<p>Un dossier de fichiers texte suffit pour démarrer, jusqu'au jour où tu cherches plus que tu n'écris. <strong>Atlas Narratif</strong> range ta bible dans une base où chaque élément se retrouve en deux secondes&#8239;:</p>
<ul>
  <li><strong>La base lore</strong> réunit personnages, lieux, objets et groupes. Chaque fiche porte les champs utiles (alias, traits, origine, détenteur d'un objet, lieux visités), et tu y ajoutes <strong>tes propres champs</strong> quand le modèle ne suffit pas&#8239;: dans la démo, la fiche de Frodon porte ainsi son âge au départ, son anniversaire et sa taille.</li>
  <li><strong>Les groupes</strong> (peuple, faction, ordre, maison noble…) ont leurs membres, leur couleur et leur territoire d'origine. Un personnage peut appartenir à plusieurs groupes.</li>
  <li><strong>Les catégories personnalisées</strong> accueillent ce que ton monde invente&#8239;: tu crées un type «&#8239;Sortilèges&#8239;» ou «&#8239;Factions&#8239;» avec ses propres champs. La démo en donne un exemple avec une catégorie «&#8239;Langue&#8239;»&#8239;: quenya et sindarin, avec leur famille, leurs locuteurs et leur écriture.</li>
  <li><strong>Le graphe des relations</strong> fait apparaître les liens&#8239;: qui porte l'Anneau, qui est membre de quoi, et les relations que tu nommes toi-même (Aragorn «&#8239;parle&#8239;» le quenya).</li>
  <li><strong>La recherche globale</strong> (Ctrl+K) retrouve un nom, un alias ou un détail dans tout le projet, même si tu oublies les accents.</li>
  <li><strong>Le chat de requête</strong> répond aux questions simples à partir de tes fiches&#8239;: «&#8239;qui est Grands-Pas&#8239;?&#8239;», «&#8239;quels objets porte Frodo&#8239;?&#8239;», «&#8239;chapitre 5&#8239;». Rien d'inventé&#8239;: il lit ta bible, et seulement elle.</li>
  <li><strong>Ta bible vit déjà dans Obsidian&#8239;?</strong> Importe ton vault (fichiers .md ou archive .zip)&#8239;: Atlas lit le frontmatter et les liens entre notes, te montre un aperçu et te laisse ajuster la correspondance des champs avant de créer le projet.</li>
</ul>
<figure class="blog-figure">
  <img src="/blog/bible-univers-lore.png" alt="La base lore d'Atlas Narratif sur la démo du Seigneur des Anneaux&#8239;: onglets personnages, lieux, objets et groupes, et des fiches de personnages avec leurs surnoms, leurs groupes et leur lieu d'origine." loading="lazy" />
  <figcaption>La base lore&#8239;: personnages, lieux, objets et groupes rangés au même endroit, chaque fiche reliée à ses factions (démo LOTR).</figcaption>
</figure>
<p>Et le jour où tu dois transmettre ta bible à un éditeur ou à un co-auteur, Atlas l'exporte pour toi&#8239;: une bible des personnages prête à imprimer, ou la bible complète en Markdown.</p>

<h2>⚠️ Les erreurs classiques</h2>
<ul>
  <li><strong>Écrire la bible au lieu du roman.</strong> Si ta bible grossit plus vite que ton manuscrit, arrête-toi et écris une scène.</li>
  <li><strong>Des règles sans limites.</strong> Un pouvoir sans coût résout tout, donc plus rien ne compte.</li>
  <li><strong>La bible éparpillée.</strong> Trois carnets, un tableur, des notes dans ton téléphone&#8239;: une information introuvable n'existe pas.</li>
  <li><strong>Oublier de dater.</strong> Sur une saga, une fiche sans «&#8239;depuis quand&#8239;» finit toujours par contredire l'un de tes tomes.</li>
</ul>

<h2>✅ En résumé</h2>
<p>Une bible d'univers, c'est la mémoire de ton monde&#8239;: personnages, lieux, objets, groupes, et surtout des règles écrites avec leurs limites. Garde l'iceberg en tête (ce qui ne change aucune scène tient en une ligne), fais-la vivre au rythme de ton manuscrit, et date tes révélations dès que ta saga passe au deuxième tome.</p>
<p><strong>Atlas Narratif</strong> te donne une base lore taillée pour ça&#8239;: fiches, groupes, catégories à toi, graphe des relations, recherche instantanée. Gratuit, en français, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Construis la bible de ta saga gratuitement avec Atlas Narratif.</a> Et pour voir une bible complète, charge la démo du Seigneur des Anneaux depuis l'accueil, sans créer de compte.</p>
`,
};

const outilsGratuitsMatrix = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 540" role="img" aria-label="Matrice des outils gratuits pour écrire un roman selon cinq besoins : écrire, organiser, structurer, construire l'univers, se motiver. Un rond plein marque un point fort, un cercle un usage partiel." style="width:100%;height:auto">
    <g font-family="'Spectral',Georgia,serif" fill="#ece7db" font-size="14" text-anchor="middle">
      <text x="287" y="46">Écrire</text>
      <text x="383" y="46">Organiser</text>
      <text x="479" y="46">Structurer</text>
      <text x="575" y="46">Univers</text>
      <text x="671" y="46">Motivation</text>
    </g>
    <line x1="20" y1="62" x2="700" y2="62" stroke="#ffffff" stroke-opacity="0.14"/>
    <rect x="14" y="73" width="692" height="30" rx="6" fill="#ffffff" fill-opacity="0.03"/>
    <rect x="14" y="133" width="692" height="30" rx="6" fill="#ffffff" fill-opacity="0.03"/>
    <rect x="14" y="193" width="692" height="30" rx="6" fill="#ffffff" fill-opacity="0.03"/>
    <rect x="14" y="253" width="692" height="30" rx="6" fill="#ffffff" fill-opacity="0.03"/>
    <rect x="14" y="313" width="692" height="30" rx="6" fill="#ffffff" fill-opacity="0.03"/>
    <rect x="14" y="373" width="692" height="30" rx="6" fill="#ffffff" fill-opacity="0.03"/>
    <rect x="14" y="433" width="692" height="30" rx="6" fill="#5cae8e" fill-opacity="0.1" stroke="#5cae8e" stroke-opacity="0.4"/>
    <g font-family="'Spectral',Georgia,serif" fill="#ece7db" font-size="13.5">
      <text x="28" y="93">LibreOffice Writer</text>
      <text x="28" y="123">Google Docs</text>
      <text x="28" y="153">Reedsy Studio</text>
      <text x="28" y="183">novelWriter</text>
      <text x="28" y="213">Manuskript</text>
      <text x="28" y="243">bibisco</text>
      <text x="28" y="273">yWriter</text>
      <text x="28" y="303">oStorybook</text>
      <text x="28" y="333">Obsidian</text>
      <text x="28" y="363">Notion</text>
      <text x="28" y="393">Campfire *</text>
      <text x="28" y="423">World Anvil *</text>
      <text x="28" y="453">Atlas Narratif</text>
    </g>
    <g>
      <circle cx="287" cy="88" r="7" fill="#5cae8e"/>
      <circle cx="383" cy="88" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="287" cy="118" r="7" fill="#5cae8e"/>
      <circle cx="383" cy="118" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="287" cy="148" r="7" fill="#5cae8e"/>
      <circle cx="383" cy="148" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="671" cy="148" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="287" cy="178" r="7" fill="#5cae8e"/>
      <circle cx="383" cy="178" r="7" fill="#5cae8e"/>
      <circle cx="575" cy="178" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="287" cy="208" r="7" fill="#5cae8e"/>
      <circle cx="383" cy="208" r="7" fill="#5cae8e"/>
      <circle cx="479" cy="208" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="575" cy="208" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="671" cy="208" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="287" cy="238" r="7" fill="#5cae8e"/>
      <circle cx="383" cy="238" r="7" fill="#5cae8e"/>
      <circle cx="479" cy="238" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="575" cy="238" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="671" cy="238" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="287" cy="268" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="383" cy="268" r="7" fill="#5cae8e"/>
      <circle cx="575" cy="268" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="287" cy="298" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="383" cy="298" r="7" fill="#5cae8e"/>
      <circle cx="479" cy="298" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="575" cy="298" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="287" cy="328" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="383" cy="328" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="575" cy="328" r="7" fill="#5cae8e"/>
      <circle cx="383" cy="358" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="575" cy="358" r="7" fill="#5cae8e"/>
      <circle cx="287" cy="388" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="383" cy="388" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="479" cy="388" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="575" cy="388" r="7" fill="#5cae8e"/>
      <circle cx="575" cy="418" r="7" fill="#5cae8e"/>
      <circle cx="383" cy="448" r="6" fill="none" stroke="#cba15e" stroke-width="2"/>
      <circle cx="479" cy="448" r="7" fill="#5cae8e"/>
      <circle cx="575" cy="448" r="7" fill="#5cae8e"/>
    </g>
    <line x1="20" y1="484" x2="700" y2="484" stroke="#ffffff" stroke-opacity="0.14"/>
    <g font-family="ui-monospace,Menlo,monospace" fill="#a9a291" font-size="11.5">
      <circle cx="34" cy="510" r="6" fill="#5cae8e"/>
      <text x="48" y="514">point fort</text>
      <circle cx="160" cy="510" r="5" fill="none" stroke="#cba15e" stroke-width="2"/>
      <text x="174" y="514">usage partiel</text>
      <text x="300" y="514">* offre gratuite limitée</text>
    </g>
  </svg>
  <figcaption>Cinq besoins, treize outils gratuits ou freemium&#8239;: aucun ne coche toutes les cases, d'où l'intérêt de les combiner.</figcaption>
</figure>`;

const outilsGratuits = {
  slug: 'outils-gratuits-ecrire-roman',
  pillar: 'P3',
  metaTitle: 'Outils gratuits pour écrire un roman : comparatif 2026',
  title: 'Les meilleurs outils gratuits pour écrire un roman en 2026',
  description:
    'Logiciel d\'écriture de roman gratuit : le comparatif honnête 2026 par besoin (écrire, organiser, structurer, univers, motivation), limites comprises.',
  excerpt:
    'Écrire, organiser, structurer, construire ton univers, tenir le rythme : les outils vraiment gratuits pour chaque besoin, leurs limites, et les combos qui marchent.',
  date: '2026-12-15',
  readingTime: '9 min',
  tags: ['Outils', 'Logiciels gratuits', 'Écriture', 'Comparatif'],
  emoji: '🧰',
  html: `
<p>Tu as une histoire en tête, peut-être déjà quelques chapitres, et tu te demandes où l'écrire. Tu tapes «&#8239;logiciel écriture roman gratuit&#8239;» et tu tombes sur des listes de vingt outils, tous «&#8239;les meilleurs&#8239;», dont la moitié sont en réalité payants, abandonnés depuis des années ou limités au point d'être inutilisables passé le chapitre 5.</p>
<p>Ce comparatif prend le problème à l'envers. Au lieu de chercher <em>le</em> logiciel parfait, on part de ce dont tu as besoin, et pour chaque besoin, les outils gratuits qui tiennent vraiment la route en 2026. On a vérifié chaque offre sur le site de l'éditeur à l'automne 2026. Et une précision d'emblée, par honnêteté&#8239;: l'un des outils cités, Atlas Narratif, est l'outil que nous développons. On te dira donc aussi ce qu'il ne fait pas.</p>

<h2>🧰 Cinq besoins, pas un logiciel magique</h2>
<p>Écrire un roman, ce n'est pas une seule tâche. Ce sont au moins cinq métiers qui se chevauchent&#8239;:</p>
<ol>
  <li><strong>Écrire le texte</strong>&#8239;: aligner des phrases, confortablement, sans rien perdre.</li>
  <li><strong>Organiser le manuscrit</strong>&#8239;: découper en chapitres et en scènes, les déplacer, retrouver un passage.</li>
  <li><strong>Structurer l'intrigue</strong>&#8239;: poser tes temps forts, vérifier que l'histoire tient debout et reste cohérente.</li>
  <li><strong>Construire l'univers</strong>&#8239;: tes personnages, tes lieux, tes règles du monde.</li>
  <li><strong>Te motiver</strong>&#8239;: suivre ton avancée, tenir un rythme.</li>
</ol>
<p>Aucun outil gratuit ne fait tout bien. Le logiciel «&#8239;tout-en-un&#8239;» de référence, Scrivener, est payant (environ 60 dollars la licence sur ordinateur, avec un essai de 30 jours d'utilisation). Bonne nouvelle&#8239;: en combinant deux outils gratuits bien choisis, tu couvres l'essentiel. Et un mot sur le vocabulaire, parce qu'il compte&#8239;: <strong>gratuit</strong> (tout est offert), <strong>freemium</strong> (offre gratuite limitée, le reste est payant) et <strong>essai gratuit</strong> (payant après quelques semaines) sont trois choses très différentes.</p>
${outilsGratuitsMatrix}

<h2>✍️ Écrire le texte</h2>
<p>Pour aligner les mots, un bon traitement de texte suffit largement. Beaucoup de romans publiés ont été écrits dans un simple fichier.</p>
<ul>
  <li><strong>LibreOffice Writer.</strong> Libre, gratuit, en français, sur Windows, macOS et Linux. Ses styles de titres et son navigateur te permettent de sauter d'un chapitre à l'autre dans un long document, et il exporte en PDF. Tes fichiers restent sur ton ordinateur.</li>
  <li><strong>Google Docs.</strong> Gratuit avec un compte Google, dans le navigateur. Son vrai atout&#8239;: les commentaires et le partage, parfaits pour tes bêta-lecteurs. Revers de la médaille&#8239;: ton texte vit sur les serveurs de Google.</li>
  <li><strong>Reedsy Studio.</strong> Un éditeur en ligne pensé pour les livres. L'écriture et la mise en page sont gratuites, avec export PDF et EPUB. L'offre gratuite est limitée sur le reste&#8239;: 30 jours d'historique, un seul objectif, tableau de planification en vue cartes uniquement.</li>
</ul>
<p>Leur limite commune&#8239;: au-delà de 300 pages, un document unique devient pénible à manipuler. C'est là qu'entrent en scène les logiciels d'organisation.</p>

<h2>🗂️ Organiser le manuscrit</h2>
<p>Ces logiciels découpent ton roman en chapitres et en scènes que tu réorganises à volonté, avec des fiches pour tes personnages et tes lieux. C'est la famille la plus riche en outils gratuits, et de loin.</p>
<ul>
  <li><strong>novelWriter.</strong> Libre et gratuit, sur Windows, Linux et macOS (sur Mac, l'installation demande un peu de bricolage). Tu écris en texte brut avec une syntaxe légère proche du Markdown, ce qui rend tes fichiers lisibles pour toujours. Interface traduite en français, développement très actif (nouvelle version en septembre 2026).</li>
  <li><strong>Manuskript.</strong> Libre et gratuit, disponible en français. Plan hiérarchique, mode sans distraction, objectifs de mots, et un assistant fondé sur la méthode du flocon. Il est officiellement proposé sur Windows et Linux, et ses développeurs préviennent qu'il reste en chantier&#8239;: sauvegarde souvent.</li>
  <li><strong>bibisco.</strong> Très apprécié pour ses fiches personnages sous forme d'interview. L'édition Community est gratuite, en français, sur Windows, macOS et Linux&#8239;: chapitres, scènes, lieux, chronologie, objectifs d'écriture, export DOCX, PDF et EPUB. Une édition Supporters payante (69 dollars, en une fois) et une synchronisation mobile par abonnement existent à côté.</li>
  <li><strong>yWriter.</strong> Le vétéran, gratuit, conçu par un romancier. Il découpe le roman en scènes et suit personnages, lieux et objets. Pour Windows d'abord, avec des versions mobiles. Si tu préfères écrire dans LibreOffice, <strong>novelibre</strong> (libre) reprend l'approche en s'appuyant sur ton traitement de texte, et sait importer les projets yWriter grâce à un module dédié.</li>
  <li><strong>oStorybook.</strong> Libre, gratuit, disponible en français et mis à jour plusieurs fois par an depuis une décennie (dernière version en avril 2026). Personnages, lieux, scènes, objets, idées&#8239;: une vraie base de travail pour l'auteur méthodique.</li>
</ul>

<h2>🧭 Structurer l'intrigue et garder la cohérence</h2>
<p>C'est le besoin le moins bien servi par le gratuit. Les outils ci-dessus rangent ton texte&#8239;; peu t'aident à voir si ton intrigue tient. Où tombe ton midpoint&#8239;? Tel personnage disparaît-il pendant dix chapitres&#8239;? Cette amorce du chapitre 3 est-elle payée&#8239;? La référence du secteur, <strong>Plottr</strong>, n'a pas d'offre gratuite (essai de 30 jours, puis abonnement ou licence).</p>
<p>C'est précisément ce vide qu'<strong>Atlas Narratif</strong> essaie de combler. Rappel&#8239;: c'est l'outil que nous développons, alors lis ce paragraphe avec le recul qui s'impose. Atlas est gratuit, en français, et tes textes y sont chiffrés, sans tracking. Tu y poses ta structure (les 15 beats de Save the Cat ou les 12 étapes du Voyage du Héros), ta timeline, tes personnages, lieux et objets, une carte avec les trajets de tes personnages, et un détecteur signale les incohérences. Le tableau de bord résume le tout&#8239;: un score de santé narrative (un diagnostic, pas un verdict), et des recommandations concrètes comme les beats manquants ou les personnages absents de la timeline.</p>
<figure class="blog-figure">
  <img src="/blog/atlas-tableau-de-bord.png" alt="Le tableau de bord d'Atlas Narratif sur la démo du Seigneur des Anneaux&#8239;: statistiques du projet, score de santé narrative et vue série, avec pour chaque tome la structure, l'arc et les incohérences à traiter." loading="lazy" />
  <figcaption>Le tableau de bord&#8239;: statistiques, score de santé et bilan tome par tome de la trilogie en un coup d'œil (démo LOTR).</figcaption>
</figure>
<p>Ses limites, maintenant, parce qu'elles comptent autant&#8239;:</p>
<ul>
  <li><strong>Ce n'est pas un traitement de texte.</strong> Tu n'y écris pas ton roman&#8239;: tu écris ailleurs, et Atlas garde la carte de ton histoire. Tu peux y prendre des notes par chapitre, rien de plus.</li>
  <li><strong>C'est une application web</strong>&#8239;: il te faut une connexion, et un compte pour créer ton propre projet (la démo, elle, se charge sans compte).</li>
  <li><strong>Pas de suivi du nombre de mots</strong> ni d'objectifs d'écriture&#8239;: ce n'est pas son rôle.</li>
</ul>
<p>Si tu débutes sur ces notions, notre guide pour <a href="/blog/detecter-incoherences-roman">détecter les incohérences de ton roman</a> te donne la méthode, outil ou pas.</p>

<h2>🌍 Construire ton univers</h2>
<p>Pour la fantasy, la SF ou toute saga, tu auras vite besoin d'une «&#8239;bible&#8239;»&#8239;: fiches, règles, chronologies, cartes.</p>
<ul>
  <li><strong>Obsidian.</strong> Gratuit sans limite pour un usage personnel, sans inscription. Tes notes sont de simples fichiers Markdown sur ton disque, reliées entre elles par des liens. Idéal pour un wiki d'univers qui grandit avec toi. Seuls la synchronisation et la publication en ligne sont payantes.</li>
  <li><strong>Notion.</strong> Gratuit pour un usage individuel, en français. Ses bases de données font d'excellentes fiches personnages filtrables. Limites de l'offre gratuite&#8239;: fichiers de 5 Mo maximum et 7 jours d'historique. Tout est en ligne.</li>
  <li><strong>Campfire</strong> (offre gratuite limitée). Des modules dédiés au worldbuilding&#8239;: personnages, cartes, timeline, systèmes de magie. Le gratuit plafonne vite&#8239;: 25 000 mots de manuscrit, 10 personnages, 20 événements, 2 cartes.</li>
  <li><strong>World Anvil</strong> (offre gratuite limitée). Le wiki d'univers le plus complet, très prisé des rôlistes. En gratuit, tes mondes ne sont pas vraiment privés et les fonctions avancées sont réservées aux abonnés.</li>
</ul>
<p>Pour savoir quoi mettre dans cette bible avant de choisir l'outil, lis notre guide pour <a href="/blog/creer-bible-univers-worldbuilding">créer la bible de ton univers</a>.</p>

<h2>🔥 Te motiver et tenir le rythme</h2>
<p>Aucun outil n'écrira à ta place, mais certains rendent la régularité visible&#8239;: Manuskript et bibisco proposent des objectifs de mots, Reedsy Studio un objectif de manuscrit dans son offre gratuite. Le reste est affaire d'habitude&#8239;: une heure fixe, un compteur, et un plan qui te dit quelle scène écrire aujourd'hui. Si tu prépares le défi d'écriture de novembre, notre méthode pour <a href="/blog/planifier-roman-novembre-methode">planifier ton roman de novembre</a> t'aidera à arriver le 1er avec une feuille de route.</p>

<h2>🔗 Trois combos d'outils gratuits qui marchent</h2>
<ul>
  <li><strong>Le minimaliste&#8239;: LibreOffice Writer + Atlas Narratif.</strong> Tu écris dans un traitement de texte que tu maîtrises, et tu tiens ta structure, ta timeline et tes personnages dans Atlas. Deux fenêtres, presque rien à apprendre.</li>
  <li><strong>L'architecte&#8239;: novelWriter ou bibisco + Atlas Narratif.</strong> L'un organise tes scènes et ton texte, l'autre vérifie que l'intrigue tient sur la durée&#8239;: beats, amorces, incohérences.</li>
  <li><strong>Le bâtisseur de mondes&#8239;: Obsidian + Atlas Narratif.</strong> Tu construis ton univers dans Obsidian, puis tu importes ton vault (fichiers .md ou .zip) dans Atlas pour y retrouver tes personnages, lieux et objets, prêts à prendre place sur ta timeline et ta carte.</li>
</ul>

<h2>⚠️ Les pièges du «&#8239;gratuit&#8239;»</h2>
<ul>
  <li><strong>Le freemium qui te rattrape au chapitre 12.</strong> Une limite de 10 personnages ou 25 000 mots paraît large au début. Regarde les plafonds avant d'y verser trois ans de travail.</li>
  <li><strong>Le format prisonnier.</strong> Vérifie que tu peux exporter ton texte dans un format ouvert (DOCX, ODT, texte brut, Markdown). Ton roman doit pouvoir survivre à l'outil.</li>
  <li><strong>Le projet abandonné.</strong> Regarde la date de la dernière version. Tous les outils de cette liste ont été mis à jour récemment, mais ce n'est pas le cas de tous ceux qu'on te recommande ailleurs.</li>
  <li><strong>Collectionner les outils au lieu d'écrire.</strong> Tester douze logiciels est une forme élégante de procrastination. Choisis-en deux, et écris.</li>
</ul>

<h2>✅ En résumé</h2>
<p>Pas besoin de payer pour écrire un roman en 2026. Pour le texte, LibreOffice Writer ou Google Docs. Pour organiser un long manuscrit, novelWriter, bibisco, Manuskript, yWriter ou oStorybook. Pour l'univers, Obsidian ou Notion, et Campfire ou World Anvil si leurs limites gratuites te suffisent. Pour la structure et la cohérence, le gratuit est plus rare&#8239;: c'est la place que veut tenir Atlas Narratif, notre outil, à côté de ton traitement de texte et non à sa place.</p>
<p>Le plus simple pour juger, c'est de voir. Sur <strong>Atlas Narratif</strong>, la démo du Seigneur des Anneaux se charge depuis l'accueil sans créer de compte&#8239;: trois tomes, leurs beats, leur carte et leurs incohérences. Gratuit, en français, tes textes chiffrés, sans aucun tracking&#8239;: l'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Explore la démo d'Atlas Narratif</a>, puis garde ton traitement de texte préféré pour écrire et Atlas pour tenir la carte de ton histoire.</p>
`,
};

const carteLotrSeparationsDiagram = `
<figure class="blog-figure">
  <svg viewBox="0 0 720 340" role="img" aria-label="Schéma des séparations et convergences de la Communauté de l'Anneau au fil des chapitres de la démo&#8239;: réunie à Fondcombe, brisée à Amon Hen en trois routes, Gandalf retrouvé à Fangorn, Merry et Pippin retrouvés à Isengard, nouvelle dispersion, rassemblement au Pelennor, Porte Noire et Mont Destin le même jour, tous réunis au couronnement." style="width:100%;height:auto">
    <!-- repères verticaux des chapitres clés -->
    <g stroke="#ffffff" stroke-opacity="0.08">
      <line x1="60" y1="26" x2="60" y2="288"/>
      <line x1="114" y1="26" x2="114" y2="288"/>
      <line x1="168" y1="26" x2="168" y2="288"/>
      <line x1="276" y1="26" x2="276" y2="288"/>
      <line x1="438" y1="26" x2="438" y2="288"/>
      <line x1="573" y1="26" x2="573" y2="288"/>
      <line x1="690" y1="26" x2="690" y2="288"/>
    </g>
    <!-- Gandalf : présent, puis disparu après la Moria, puis revenu -->
    <polyline fill="none" stroke="#a9a291" stroke-width="2" points="60,152 114,152"/>
    <polyline fill="none" stroke="#a9a291" stroke-width="1.5" stroke-dasharray="2 5" stroke-opacity="0.6" points="114,152 136,60 256,60"/>
    <polyline fill="none" stroke="#a9a291" stroke-width="2" stroke-linejoin="round" points="256,60 276,96 438,96 465,36 546,36 573,90 627,90 690,128"/>
    <!-- Aragorn, Legolas, Gimli -->
    <polyline fill="none" stroke="#5cae8e" stroke-width="2.5" stroke-linejoin="round" points="60,156 168,156 195,100 627,100 690,130"/>
    <!-- Pippin -->
    <polyline fill="none" stroke="#ece7db" stroke-width="2" stroke-dasharray="5 3" stroke-linejoin="round" points="60,160 168,160 195,178 411,178 438,104 465,40 546,40 573,94 627,94 690,132"/>
    <!-- Merry -->
    <polyline fill="none" stroke="#ece7db" stroke-width="2" stroke-linejoin="round" points="60,164 168,164 195,182 411,182 438,108 465,150 546,150 573,106 600,150 660,150 690,134"/>
    <!-- Frodon et Sam -->
    <polyline fill="none" stroke="#cba15e" stroke-width="2.5" stroke-linejoin="round" points="60,168 168,168 195,260 654,260 690,138"/>
    <!-- 25 mars : même jour, deux chapitres -->
    <line x1="627" y1="100" x2="654" y2="260" stroke="#cba15e" stroke-width="1" stroke-dasharray="3 3" stroke-opacity="0.8"/>
    <circle cx="627" cy="98" r="3.5" fill="#cba15e"/>
    <circle cx="654" cy="260" r="3.5" fill="#cba15e"/>
    <!-- rassemblements (losange plein) et scissions (losange creux) -->
    <g>
      <rect x="55" y="155" width="10" height="10" transform="rotate(45 60 160)" fill="#5cae8e"/>
      <rect x="109" y="147" width="10" height="10" transform="rotate(45 114 152)" fill="none" stroke="#cba15e" stroke-width="1.5"/>
      <rect x="163" y="155" width="10" height="10" transform="rotate(45 168 160)" fill="none" stroke="#cba15e" stroke-width="1.5"/>
      <rect x="271" y="93" width="10" height="10" transform="rotate(45 276 98)" fill="#5cae8e"/>
      <rect x="433" y="97" width="10" height="10" transform="rotate(45 438 102)" fill="#5cae8e"/>
      <rect x="568" y="93" width="10" height="10" transform="rotate(45 573 98)" fill="#5cae8e"/>
      <rect x="685" y="127" width="10" height="10" transform="rotate(45 690 132)" fill="#5cae8e"/>
    </g>
    <!-- étiquettes des groupes -->
    <g font-family="'Spectral',Georgia,serif" font-size="12.5">
      <text x="142" y="52" fill="#a9a291">Gandalf, disparu en Moria</text>
      <text x="204" y="120" fill="#5cae8e">Aragorn, Legolas, Gimli</text>
      <text x="204" y="200" fill="#ece7db">Merry et Pippin</text>
      <text x="204" y="280" fill="#cba15e">Frodon et Sam</text>
      <text x="470" y="60" fill="#a9a291">Gandalf et Pippin</text>
      <text x="470" y="168" fill="#ece7db">Merry</text>
      <text x="636" y="215" fill="#cba15e" font-size="11.5" text-anchor="end">même jour</text>
    </g>
    <!-- lieux des convergences -->
    <g font-family="'Spectral',Georgia,serif" fill="#ece7db" font-size="12.5" text-anchor="middle">
      <text x="114" y="18">Moria</text>
      <text x="276" y="18">Fangorn</text>
      <text x="573" y="18">Pelennor</text>
      <text x="690" y="18" text-anchor="end">Couronnement</text>
      <text x="60" y="306">Fondcombe</text>
      <text x="168" y="306">Amon Hen</text>
      <text x="438" y="306">Isengard</text>
      <text x="610" y="306">Porte Noire et Mont Destin</text>
    </g>
    <g font-family="ui-monospace,Menlo,monospace" fill="#a9a291" font-size="10.5" text-anchor="middle">
      <text x="60" y="326">ch. 5</text>
      <text x="168" y="326">ch. 9</text>
      <text x="438" y="326">ch. 19</text>
      <text x="690" y="326" text-anchor="end">ch. 28</text>
    </g>
  </svg>
  <figcaption>La Communauté au fil des chapitres de la démo&#8239;: losange plein = rassemblement, losange creux = scission. Les deux points dorés se passent le même jour, à deux chapitres d'écart.</figcaption>
</figure>`;

const carteLotrEtudeDeCas = {
  slug: 'carte-seigneur-des-anneaux-etude-de-cas',
  pillar: 'P3',
  metaTitle: 'Créer la carte de son roman : le cas du Seigneur des Anneaux',
  title: 'Créer la carte de ton roman : le Seigneur des Anneaux, trajet par trajet',
  description:
    "Distances, temps de voyage, séparations et retrouvailles : la carte du Seigneur des Anneaux trajet par trajet, et la méthode pour créer celle de ton roman.",
  excerpt:
    "Après Amon Hen, la Communauté éclate en plusieurs routes. On suit chaque trajet sur la carte, puis on construit celle de ton roman, chapitre par chapitre.",
  date: '2027-01-12',
  readingTime: '9 min',
  tags: ['Carte', 'Le Seigneur des Anneaux', 'Étude de cas', 'Worldbuilding'],
  emoji: '🗺️',
  html: `
<p>Ta carte est magnifique. Tu l'as dessinée à la main ou montée dans un générateur, elle a ses montagnes, ses fleuves, ses noms qui sonnent juste. Elle trône en tête de ton dossier. Et pourtant, au chapitre 14, quand tu te demandes où se trouve ton second rôle et combien de jours il lui faut pour rejoindre les autres, elle ne te répond rien.</p>
<p>C'est normal&#8239;: une carte posée à plat est un décor. Pour qu'elle serve ta structure, il faut la faire bouger avec ton récit. Tolkien l'avait compris mieux que personne. Dans une lettre de 1954, il écrit avoir «&#8239;sagement commencé par une carte&#8239;» et ajusté l'histoire dessus, «&#8239;avec un soin méticuleux pour les distances&#8239;». On va suivre ses personnages trajet par trajet, puis voir comment faire la carte de ton propre roman.</p>

<h2>🧭 Une carte, c'est une horloge</h2>
<p>Une carte de roman répond à trois questions que ton plan de chapitres ne pose jamais.</p>
<ul>
  <li><strong>Combien de temps&#8239;?</strong> Une distance, c'est une durée. Si ton héros traverse un royaume en une nuit, il faut un cheval, un sortilège ou une bonne excuse.</li>
  <li><strong>Qui est où, à tel chapitre&#8239;?</strong> Dès que tes personnages ne voyagent plus ensemble, chacun vit sur sa propre horloge. Ton lecteur, lui, les suit à tour de rôle.</li>
  <li><strong>Qui se sépare, qui se retrouve&#8239;?</strong> Chaque séparation ouvre une question («&#8239;vont-ils se revoir&#8239;?&#8239;»), chaque réunion la referme. Ce sont des beats à part entière.</li>
</ul>
<p>Tolkien a poussé la rigueur très loin&#8239;: il a calé tous ses fils sur un calendrier commun, jusqu'aux phases de la lune, et ses tableaux de dates finiront en appendice. La Communauté quitte Fondcombe le 25 décembre, se brise le 26 février, et l'Anneau est détruit le 25 mars. Entre ces dates, tout le monde est quelque part, et ça doit tenir.</p>
<p>Si tu veux revoir la charpente générale de la saga (beats, arcs, amorces), on l'a décortiquée dans <a href="/blog/structure-seigneur-des-anneaux">la structure du Seigneur des Anneaux</a>. Ici, on zoome sur la géographie.</p>

<h2>💍 Amon Hen, le jour où la carte se fend</h2>
<p>Jusqu'à Parth Galen, la carte du <em>Seigneur des Anneaux</em> est simple&#8239;: un seul trait, parfois deux. Frodon, Sam, Merry et Pippin quittent la Comté, rencontrent Grands-Pas à Bree, et la Communauté se forme à Fondcombe. Gandalf la guide jusqu'à la Moria, où il tombe. Un premier personnage sort de la carte.</p>
<p>Puis vient Amon Hen, à la fin du premier tome. Boromir tente de prendre l'Anneau, Frodon s'enfuit avec Sam, Merry et Pippin sont capturés par les Uruk-hai, Boromir meurt en les défendant. En quelques pages, un trait unique devient trois routes, et Gandalf en ouvrira bientôt une quatrième. Tout le deuxième tome repose sur cette dispersion.</p>
${carteLotrSeparationsDiagram}
<p>Ce qui frappe, c'est l'économie du dispositif. Il n'y a que quelques points de convergence, et chacun est un temps fort&#8239;: Gandalf revenu à Fangorn, Merry et Pippin assis dans les ruines d'Isengard, le Pelennor, le couronnement. Entre ces points, chaque groupe a son propre rythme.</p>

<h2>🚶 Les quatre trajets, un par un</h2>
<h3>Frodon et Sam&#8239;: la route la plus courte, et la plus longue</h3>
<p>Emyn Muil, où ils capturent Gollum. Les Marais des Morts. La Porte Noire, fermée. L'Ithilien, où Faramir les arrête. Puis l'escalier de Cirith Ungol, l'antre d'Arachne, la tour, le plateau de Gorgoroth et le Mont Destin. Sur la carte, c'est le trajet le plus court de tous. À la lecture, c'est le plus long&#8239;: chaque kilomètre coûte. La lenteur <em>est</em> le sujet, et la carte le rend visible.</p>
<h3>Aragorn, Legolas et Gimli&#8239;: la course</h3>
<p>À l'opposé, les trois chasseurs avalent le Rohan à la poursuite des Uruk-hai. Quand Éomer les croise, il n'en revient pas&#8239;: quarante-cinq lieues à pied en moins de quatre jours, plus de deux cents kilomètres. Tolkien fait de la distance un exploit, donc un trait de caractère. Puis Fangorn, Edoras, le Gouffre de Helm, Isengard, les Chemins des Morts, Pelargir, et l'arrivée au Pelennor par le fleuve, sur les navires des Corsaires.</p>
<h3>Merry et Pippin&#8239;: séparés deux fois</h3>
<p>Capturés à Amon Hen, ils s'échappent dans Fangorn, rencontrent Sylvebarbe et suivent les Ents jusqu'à Isengard, où les autres les retrouvent. Belles retrouvailles, qui ne durent pas. Après le palantír, Pippin part avec Gandalf pour Minas Tirith&#8239;; Merry reste avec le Rohan et chevauche jusqu'au Pelennor, où il frappe le Roi-Sorcier aux côtés d'Éowyn. Deux hobbits inséparables, rendus indépendants par la carte. C'est leur arc.</p>
<h3>Gandalf&#8239;: l'absence comme information</h3>
<p>Gandalf est le seul dont le trajet a un trou. Tombé en Moria au premier tome, il disparaît jusqu'à Fangorn, où il revient en Gandalf le Blanc. Ce vide est un outil dramatique&#8239;: le lecteur le croit mort, et chaque chapitre sans lui pèse. Sur ta propre carte, qu'un personnage s'efface doit être un choix, jamais un oubli.</p>
<h3>Le 25 mars&#8239;: la convergence invisible</h3>
<p>Le plus beau rendez-vous du livre n'a pas lieu au même endroit. Le 25 mars, Aragorn mène l'armée de l'Ouest devant la Porte Noire pour attirer l'Œil de Sauron, pendant que Frodon et Sam gravissent le Mont Destin. La diversion n'a de sens que si les deux fils sont synchronisés au jour près. Tolkien les raconte dans des chapitres différents&#8239;: c'est la carte et la chronologie, ensemble, qui garantissent que ça tient.</p>

<h2>🔭 Ce que la carte montre qu'aucun plan ne montre</h2>
<p>Tous ces trajets vivent dans la démo d'Atlas Narratif. La carte ne les invente pas&#8239;: elle les déduit de ta timeline. Chaque scène a un chapitre, un lieu et des personnages présents&#8239;; la carte relie les points dans l'ordre.</p>
<p>Le <strong>curseur de chapitre</strong> pilote le temps pour tout le monde à la fois. Tu le glisses après Amon Hen, et chaque personnage se place là où il est à ce moment du récit. Le long de la piste, des repères signalent les rassemblements et les scissions, et une légende te dit qui est ensemble, et où. Un bouton de lecture animée fait défiler le récit chapitre par chapitre, pour voir la Communauté se disperser puis se recomposer.</p>
<figure class="blog-figure">
  <img src="/blog/carte-curseur-chapitre.png" alt="La carte d'Atlas Narratif avec le curseur placé au chapitre 13, la forêt de Fangorn&#8239;: trois trajets y convergent tandis que celui de Frodon poursuit seul vers l'est." loading="lazy" />
  <figcaption>Chapitre 13, après la dissolution de la Communauté&#8239;: trois trajets se rejoignent à Fangorn, Frodon poursuit seul sa route (démo LOTR).</figcaption>
</figure>
<p>La <strong>frise de présence</strong> répond à la question «&#8239;qui est où&#8239;?&#8239;» sans même regarder la carte. Une barre par personnage, une case par chapitre, colorée selon le lieu où il se trouve. Un point marque les chapitres où il porte le point de vue. Tu cliques sur une colonne, le curseur saute à ce chapitre. D'un coup d'œil, tu vois les couleurs se séparer après Amon Hen et se rejoindre à Isengard.</p>
<figure class="blog-figure">
  <img src="/blog/carte-frise-presence.png" alt="La frise de présence d'Atlas Narratif&#8239;: une barre par personnage du Seigneur des Anneaux, une case par chapitre, colorée selon le lieu où il se trouve." loading="lazy" />
  <figcaption>Qui est où, chapitre par chapitre&#8239;: une couleur par lieu, un point pour le point de vue (démo LOTR).</figcaption>
</figure>
<p>Enfin, les <strong>mini-cartes</strong> affichent le trajet complet de chaque personnage côte à côte. Frodon d'un côté, Aragorn de l'autre&#8239;: la route courte et lente face à la grande boucle rapide, en une seule image.</p>

<h2>✏️ Créer la carte de ton roman, pas à pas</h2>
<ol>
  <li><strong>Pose un fond de carte.</strong> Un dessin scanné, une carte générée, même un croquis photographié&#8239;: n'importe quelle image fait l'affaire. Elle n'a pas besoin d'être belle, elle a besoin d'être à l'échelle de ton histoire.</li>
  <li><strong>Place tes lieux.</strong> En mode placement, tu cliques sur la carte et tu choisis quel lieu de ton univers se trouve là. Choisis la bonne granularité&#8239;: un lieu doit correspondre à l'endroit où tes personnages peuvent réellement se croiser.</li>
  <li><strong>Relie chaque scène à un lieu et à ses personnages.</strong> Dans ta timeline, indique où se passe chaque scène et qui y est présent. Les trajets se dessinent tout seuls, chapitre après chapitre. Tu peux aussi tracer un trajet à la main, étape par étape, si tu n'as pas encore découpé tes scènes.</li>
  <li><strong>Marque les morts.</strong> Si un personnage meurt, indique-le sur sa fiche&#8239;: son trajet s'arrête sur la carte, et le <a href="/blog/detecter-incoherences-roman">détecteur d'incohérences</a> te signale s'il réapparaît dans une scène postérieure.</li>
</ol>
<h3>Les vérifications à faire, chapitre par chapitre</h3>
<p>Une fois tes trajets posés, fais glisser le curseur du début à la fin et pose-toi ces questions. C'est toi qui juges&#8239;: la carte met simplement les réponses sous tes yeux.</p>
<ul>
  <li><strong>Personne à deux endroits.</strong> Un personnage ne peut pas être à la frontière au chapitre 12 et à la capitale au chapitre 13 si trois semaines de route les séparent. Sur la frise, chaque changement de couleur est un voyage&#8239;: vérifie qu'il est faisable.</li>
  <li><strong>Des distances qui tiennent.</strong> Compare l'écart entre deux points au temps écoulé dans ta chronologie. Les chasseurs de Tolkien courent quatre jours, et l'exploit est commenté dans le texte&#8239;: fais de même si tes personnages vont trop vite.</li>
  <li><strong>Des retrouvailles justifiées.</strong> Quand deux fils se rejoignent, demande-toi comment chacun sait où aller. Un rendez-vous fixé, un message, un hasard assumé&#8239;?</li>
  <li><strong>Des personnages oubliés.</strong> Une barre qui garde la même couleur pendant dix chapitres, c'est un personnage mis de côté. Silence voulu, comme Gandalf, ou oubli&#8239;?</li>
</ul>

<h2>⚠️ Les erreurs classiques</h2>
<ul>
  <li><strong>Des lieux trop vastes.</strong> Si ton lieu s'appelle «&#8239;Fangorn&#8239;», tous les personnages qui y passent semblent réunis. Or chez Tolkien, les trois chasseurs et les hobbits sont dans la même forêt sans jamais se croiser&#8239;: ils ne se retrouvent qu'à Isengard. Découpe tes grandes zones en endroits précis.</li>
  <li><strong>Confondre chapitre et jour.</strong> Deux chapitres consécutifs peuvent se passer le même jour, ou à un mois d'écart. Tolkien raconte le 25 mars deux fois, à deux endroits. Ta carte dit <em>où</em>, ta <a href="/blog/creer-une-timeline-roman">timeline</a> dit <em>quand</em>&#8239;: il te faut les deux.</li>
  <li><strong>Une carte figée.</strong> Tu la dessines avant d'écrire, puis tu déplaces une ville au tome 2 sans la mettre à jour. La carte doit vivre avec le manuscrit, ou elle finit par te mentir.</li>
  <li><strong>Des personnages qui se téléportent.</strong> Le classique des sagas&#8239;: un personnage secondaire réapparaît pile où l'intrigue a besoin de lui. Si la carte ne peut pas expliquer son trajet, ton lecteur non plus.</li>
</ul>

<h2>✅ En résumé</h2>
<p>La carte du <em>Seigneur des Anneaux</em> n'est pas une illustration, c'est un outil de structure. Elle transforme les distances en temps, montre qui est où à chaque chapitre, et fait de chaque séparation et de chaque réunion un moment dramatique. Après Amon Hen, quatre routes, quelques convergences bien choisies, et un rendez-vous tenu au jour près.</p>
<p>Ta carte peut jouer le même rôle. Pose ton fond, place tes lieux, relie tes scènes, puis fais défiler le récit pour vérifier que tout le monde est bien là où il doit être. Atlas Narratif est gratuit, en français, tes textes sont chiffrés et il n'y a aucun tracking. L'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Explore la carte du Seigneur des Anneaux dans la démo</a>, sans créer de compte, puis dessine les trajets de ton propre roman.</p>
`,
};

export const posts = [commentStructurerUnRoman, saveTheCat15Beats, voyageDuHeros, creerTimeline, planifierRomanNovembre, structureLOTR, detecterIncoherences, gererPlusieursTomes,
  saveTheCatOuVoyageDuHeros, amorcesPaiements, syndromeDuTome2, bibleUnivers, outilsGratuits, carteLotrEtudeDeCas];

// Date du jour au format YYYY-MM-DD (comparaison lexicographique avec `date`).
const todayISO = () => new Date().toISOString().slice(0, 10);

// Garde-fou de publication : un article est en ligne s'il n'est pas un brouillon
// ET si sa date de publication est atteinte. `today` est injectable pour les tests.
export const isPublished = (post, today = todayISO()) =>
  !post.draft && post.date <= today;

// Index /blog : publiés du jour, du plus récent au plus ancien.
// Le gate est évalué à l'appel (runtime) : un article programmé apparaît tout
// seul à sa date, sans redéploiement, dès que le navigateur charge la page.
export const getAllPosts = () =>
  posts.filter((p) => isPublished(p)).sort((a, b) => (a.date < b.date ? 1 : -1));

// Renvoie aussi les brouillons et les articles programmés (prévisualisation par URL directe).
export const getPostBySlug = (slug) => posts.find((p) => p.slug === slug) || null;

// Slugs à prérendre + entrées sitemap : publiés du jour uniquement.
// Gate évalué au moment du build (import du module par le prerender) : les
// articles programmés entrent dans le prerender/sitemap au build suivant leur date.
export const blogSlugs = posts.filter((p) => isPublished(p)).map((p) => p.slug);

// Entrées sitemap (slug + date de publication pour <lastmod>), publiés uniquement.
export const getSitemapEntries = () =>
  posts.filter((p) => isPublished(p)).map((p) => ({ slug: p.slug, date: p.date }));
