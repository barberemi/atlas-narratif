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
  date: '2026-09-22',
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
  date: '2026-10-01',
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
  date: '2026-10-02',
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

<h2>✅ En résumé</h2>
<p>Une timeline, c'est ta mémoire externe d'auteur. Retiens l'essentiel&#8239;: distingue toujours l'ordre où les choses <em>arrivent</em> de l'ordre où tu les <em>racontes</em>, ancre tes événements dans le temps, relie-les à tes chapitres, et prends de la hauteur pour piloter le rythme. Sur une saga, ce n'est plus une option.</p>
<p><strong>Atlas Narratif</strong> te donne une timeline claire, filtrable par tome et par personnage, croisée avec ta carte et tes incohérences. L'outil structure, c'est toi qui écris.</p>
<p class="blog-cta"><a href="https://atlas-narratif.com">Construis la timeline de ton roman gratuitement avec Atlas Narratif.</a> Et si tu as déjà un manuscrit, importe-le pour en obtenir la frise en quelques minutes.</p>
`,
};

export const posts = [commentStructurerUnRoman, saveTheCat15Beats, voyageDuHeros, creerTimeline];

// Articles publiés (hors brouillons) : alimentent l'index /blog, le prerender et le sitemap.
export const getAllPosts = () =>
  posts.filter((p) => !p.draft).sort((a, b) => (a.date < b.date ? 1 : -1));

// Renvoie aussi les brouillons (prévisualisation par URL directe).
export const getPostBySlug = (slug) => posts.find((p) => p.slug === slug) || null;

// Slugs prérendus/sitemap : publiés uniquement (les brouillons ne sont pas mis en ligne).
export const blogSlugs = posts.filter((p) => !p.draft).map((p) => p.slug);
