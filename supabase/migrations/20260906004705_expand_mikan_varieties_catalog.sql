alter table public.mikan_varieties
  add column if not exists aliases text[] not null default '{}'::text[],
  add column if not exists description text,
  add column if not exists parent1_id uuid,
  add column if not exists parent2_id uuid,
  add column if not exists is_visible boolean not null default true;

alter table public.mikan_varieties
  add constraint mikan_varieties_parent1_id_fkey foreign key (parent1_id) references public.mikan_varieties(id) on delete set null,
  add constraint mikan_varieties_parent2_id_fkey foreign key (parent2_id) references public.mikan_varieties(id) on delete set null;

create index if not exists mikan_varieties_parent1_id_idx on public.mikan_varieties(parent1_id);
create index if not exists mikan_varieties_parent2_id_idx on public.mikan_varieties(parent2_id);
create index if not exists mikan_varieties_visible_name_idx on public.mikan_varieties(is_visible, name);

do $migration$
declare
  catalog jsonb := $catalog$
[
{"k":1,"n":"E-647","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":11},
{"k":2,"n":"EnOwNo.21","a":[],"c":"#ff9800","s":"normal","d":"アンコール(ENcore)と興津早生(Okitsu-Wase)から生まれた中間母本","v":true,"p1":8,"p2":111},
{"k":3,"n":"No.14","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":111},
{"k":4,"n":"No.1408","a":[],"c":"#ff9800","s":"normal","d":"外観の美しく味も良いという中間母本品種。みはやの親にあたる","v":true,"p1":5,"p2":2},
{"k":5,"n":"No.2681","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":72},
{"k":6,"n":"T-378","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":111},
{"k":7,"n":"あすき","a":[],"c":"#fc9003","s":"normal","d":null,"v":true,"p1":42,"p2":110},
{"k":8,"n":"アンコール","a":["アンコールオレンジ"],"c":"#fc6203","s":"normal","d":"濃厚な甘みと香りが特徴。せとかやみはや等の親となり高級な食味を子へ伝えた","v":true,"p1":78,"p2":16},
{"k":9,"n":"ウィルキング","a":[],"c":"#fc7f03","s":"normal","d":"ウィルキング香とも呼ばれる独特の芳香をもつ温州サイズの柑橘。親のWillow leafとKingから、Wil-Kingと名付けられた。","v":true,"p1":16,"p2":78},
{"k":10,"n":"オーランド","a":[],"c":"#fc7f03","s":"round","d":"アメリカで育成されたタンジェロの一種。オレンジの芳香にバランスの良く濃厚な甘味と酸味を持つ","v":true,"p1":34,"p2":33},
{"k":11,"n":"オセオラオレンジ","a":["オセオラ"],"c":"#fc7f03","s":"round","d":"アメリカ生まれのマンダリンとタンゼロの交配種で、セミノールやミネオラの兄弟種にあたる。オラオラは誤読だよ。承太郎になっちゃう。","v":true,"p1":19,"p2":10},
{"k":12,"n":"カイコウカン","a":["海紅柑"],"c":"#ffe01d","s":"round","d":"温州みかんと文旦の交配種で、果皮が赤みを帯びる。甘味と酸味のバランスが良い","v":true,"p1":17,"p2":63},
{"k":13,"n":"カボス","a":[],"c":"#509143","s":"round","d":"主に大分県で栽培される柑橘。爽やかな香りと酸味が特徴で、料理の風味付けに使われることが多い","v":true,"p1":17,"p2":53},
{"k":14,"n":"カラタチ","a":[],"c":"#ff9800","s":"normal","d":"鋭い棘が特徴的。果実は酸味が強く食用に向かないが多くの柑橘を「接ぎ木」する土台として有用","v":true,"p1":null,"p2":null},
{"k":15,"n":"カラマンダリン","a":[],"c":"#ff9800","s":"round","d":"温州みかんサイズで手で剥ける柑橘で果肉はとろっと柔らかく甘味が濃厚。大正時代に育種が行われ、今日でも春の主要管轄となっている。","v":true,"p1":100,"p2":16},
{"k":16,"n":"キングマンダリン","a":[],"c":"#ff9800","s":"normal","d":"アメリカで自然発生したマンダリンの一種","v":true,"p1":49,"p2":null},
{"k":17,"n":"クネンボ","a":[],"c":"#ff9800","s":"normal","d":"沖縄から伝わった柑橘で、温州みかんの親にあたる","v":true,"p1":null,"p2":null},
{"k":18,"n":"グレープフルーツ","a":[],"c":"#ffe01d","s":"round","d":"大型で酸味と苦味のある柑橘。ビタミンCが豊富で健康食品としても人気","v":true,"p1":null,"p2":null},
{"k":19,"n":"クレメンティン","a":["クレメンタイン"],"c":"#ff9800","s":"normal","d":"小さめの温州のようなサイズ感のマンダリンの一種。外皮は硬めだが薄く剥きやすい。香りが良い。","v":true,"p1":null,"p2":null},
{"k":20,"n":"コウジ","a":["柑子"],"c":"#ff9800","s":"normal","d":"酸味の強い在来のみかん。柑子色（こうじいろ）という色の名前にもなっている","v":true,"p1":null,"p2":null},
{"k":21,"n":"サザンイエロー","a":[],"c":"#ffe01d","s":"deko","d":"正確には無核紀州と谷川文旦","v":true,"p1":92,"p2":103},
{"k":22,"n":"サングイネッロ","a":[],"c":"#e65100","s":"egg","d":"ブラッドオレンジの主要種で、果皮に紅みが差す。甘みが強くベリー系の芳香を持つ","v":true,"p1":44,"p2":null},
{"k":23,"n":"じゃばら","a":[],"c":"#509143","s":"round","d":"『邪気を払う』が名の由来。和歌山県北山村の希少種。花粉症対策でも注目される","v":true,"p1":17,"p2":53},
{"k":24,"n":"スイートオレンジ","a":[],"c":"#fc7f03","s":"round","d":"【分類】一般のオレンジ、ブラッドオレンジ、ネーブルオレンジなどを包含したグループ","v":true,"p1":null,"p2":null},
{"k":25,"n":"スイートスプリング","a":[],"c":"#ff9800","s":"round","d":"はっさくと大津8号の交配種。名前の通り甘味が強く酸味が少ない","v":true,"p1":39,"p2":56},
{"k":26,"n":"スダチ","a":[],"c":"#509143","s":"round","d":"主に徳島県で栽培される小型の柑橘。爽やかな香りと酸味が特徴で、料理の風味付けに使われることが多い","v":true,"p1":53,"p2":59},
{"k":27,"n":"せとか","a":[],"c":"#ff9800","s":"normal","d":"柑橘の大トロとも言われる高級柑橘。とろりとした食感と濃厚な果汁が特徴","v":true,"p1":76,"p2":47},
{"k":28,"n":"せとみ","a":["ゆめほっぺ"],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":77},
{"k":29,"n":"セミノール","a":[],"c":"#e35207","s":"deko","d":"オレンジの芳香にバランスの良く濃厚な甘味と酸味を持つ、アメリカ生まれの高級タンジェロ","v":true,"p1":34,"p2":33},
{"k":30,"n":"ダイダイ","a":["ビターオレンジ"],"c":"#fc7f03","s":"round","d":"お正月の縁起物にもなる歴史ある香酸柑橘。酸味と苦味が強くポン酢やマーマレードの加工品や精油として活用する","v":true,"p1":null,"p2":null},
{"k":31,"n":"たまみ","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":9},
{"k":32,"n":"タロッコ","a":[],"c":"#fc7f03","s":"round","d":"ブラッドオレンジの主要種で、果皮はオレンジ色。甘味と酸味のバランスが良く、独特の芳醇な香りが特徴","v":true,"p1":44,"p2":null},
{"k":33,"n":"ダンカン","a":[],"c":"#ffe01d","s":"round","d":"グレープフルーツの1品種","v":true,"p1":18,"p2":null},
{"k":34,"n":"ダンシー","a":["大紅みかん"],"c":"#e65100","s":"round","d":"インド原産の古い柑橘。鮮やかな紅色をしている。","v":true,"p1":35,"p2":null},
{"k":35,"n":"タンジェリン","a":[],"c":"#fc7f03","s":"round","d":"【分類】マンダリンがモロッコ等を経由し欧米方面に広がったもの。枝変わりなどで一般に東南のマンダリンに比べ色が濃い","v":true,"p1":49,"p2":null},
{"k":36,"n":"トロビタオレンジ","a":[],"c":"#fc7f03","s":"round","d":"アメリカで育成されたスイートオレンジの一種。甘味が強くジューシーで香りも良い。清見の親となり柑橘の高級化に貢献した","v":true,"p1":24,"p2":null},
{"k":37,"n":"ナツミカン","a":["ナツダイダイ"],"c":"#ff9800","s":"normal","d":"酸味が強く苦味のある春~初夏の柑橘。甘夏の登場によりだんだんと数を減らしている","v":true,"p1":108,"p2":57},
{"k":38,"n":"パイン柑","a":[],"c":"#ffe01d","s":"round","d":"パイナップルのような甘い香りとジューシーな果汁が特徴の高級柑橘","v":true,"p1":118,"p2":40},
{"k":39,"n":"はっさく","a":[],"c":"#ffe01d","s":"round","d":"広島県で発見された文旦と温州みかんの交配種。爽やかな酸味とほろ苦さが特徴","v":true,"p1":92,"p2":17},
{"k":40,"n":"はるか","a":[],"c":"#ffe01d","s":"deko","d":"見た目はレモン色だが酸味が皆無で優しい甘さの『奇跡の柑橘』","v":true,"p1":94,"p2":37},
{"k":41,"n":"はるき","a":[],"c":"#ff9800","s":"normal","d":"清見とポンカンの交配種で、はるみよりも酸味が強く爽やかな味わい","v":true,"p1":99,"p2":46},
{"k":42,"n":"はるみ","a":[],"c":"#ff9800","s":"normal","d":"清見とポンカンの交配種で、甘味が強く酸味が少ない食味の良い柑橘","v":true,"p1":99,"p2":46},
{"k":43,"n":"はれひめ","a":[],"c":"#ff9800","s":"normal","d":"清見と宮川早生の交配種で、甘味が強く酸味が少ない食味の良い柑橘","v":true,"p1":1,"p2":86},
{"k":44,"n":"ブラッドオレンジ","a":[],"c":"#e65100","s":"round","d":"【分類】アントシアニンが多く身の赤いオレンジの総称。代表的な品種にモロ、タロッコ、サングイネッリなどがある","v":true,"p1":24,"p2":null},
{"k":45,"n":"ページオレンジ","a":["ページ"],"c":"#fc7f03","s":"round","d":"アメリカで育成されたクレメンティンとオセオラオレンジの交配種。甘味が強くジューシーで香りも良い。","v":true,"p1":19,"p2":11},
{"k":46,"n":"ポンカン","a":[],"c":"#ff9800","s":"round","d":"独特の芳醇な香りと、サクサクとした食感。不知火（デコポン）やはるみの親としても優秀","v":true,"p1":34,"p2":67},
{"k":47,"n":"マーコット","a":["マーコットオレンジ"],"c":"#ff9800","s":"normal","d":"やや赤みがかった小ぶりのタンゴール種。オレンジのような濃厚な香りと甘味が特徴","v":true,"p1":61,"p2":60},
{"k":48,"n":"マコポン","a":[],"c":"#ff9800","s":"deko","d":"不知火(デコポン)とゼリーオレンジの交配種。濃厚な甘味とジューシーさが特徴の高級柑橘","v":true,"p1":79,"p2":69},
{"k":49,"n":"マンダリン","a":[],"c":"#ff9800","s":"normal","d":"【分類】インド原産のいわゆる「みかん」。タンジェリンはマンダリンがモロッコ等を経由しつつアメリカに渡ったもので、より赤みの強い果実","v":true,"p1":null,"p2":null},
{"k":50,"n":"ミネオラオレンジ","a":[],"c":"#e35207","s":"deko","d":"フロリダ州ミネオラで生まれたタンジェロの一種。赤みがかっており凸状突起をもつ","v":true,"p1":34,"p2":33},
{"k":51,"n":"みはや","a":[],"c":"#ff9800","s":"normal","d":"外観の美しく味も良い高級柑橘。中間母本No.1408を親に持つ","v":true,"p1":97,"p2":4},
{"k":52,"n":"モロ","a":[],"c":"#e65100","s":"round","d":"ブラッドオレンジの主要種で、果皮まで紅く染まる。ベリーにも似た風味が濃厚で、わずかに苦みがある","v":true,"p1":44,"p2":null},
{"k":53,"n":"ユズ","a":[],"c":"#ffe01d","s":"round","d":"言わずと知れた酸っぱい果実で、日本料理の香りづけに用いる。小さい果実は花柚というユズ（ホンユズ）とは別の果実","v":true,"p1":null,"p2":null},
{"k":54,"n":"ゆら早生","a":[],"c":"#ff9800","s":"normal","d":"好き...///、おっと私感が。じょうのう膜が薄く、味が濃厚な極早生~早生の温州品種。","v":true,"p1":86,"p2":null},
{"k":55,"n":"三保早生","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":86,"p2":null},
{"k":56,"n":"上田温州","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":100,"p2":null},
{"k":57,"n":"不明親","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":58,"n":"不明親","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":59,"n":"不明親(コウジ系)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":60,"n":"不明親(スイートオレンジ系統)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":61,"n":"不明親(マンダリン系統)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":62,"n":"不明親(文旦系)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":63,"n":"不明親(文旦系)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":64,"n":"不明親(文旦系)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":65,"n":"不明親(文旦系)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":66,"n":"不明親(系統不明)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":67,"n":"不明親(系統不明)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":68,"n":"不明親(起源不明)","a":[],"c":"#ff9800","s":"unknown","d":null,"v":false,"p1":null,"p2":null},
{"k":69,"n":"不知火","a":["デコポン"],"c":"#ff9800","s":"deko","d":"清見とポンカンから生まれ、甘味と酸味のバランスに凸型の見た目が人気の果実","v":true,"p1":99,"p2":46},
{"k":70,"n":"中野３号ポンカン","a":[],"c":"#ff9800","s":"round","d":null,"v":true,"p1":46,"p2":null},
{"k":71,"n":"今村温州","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":100,"p2":null},
{"k":72,"n":"伊予柑","a":[],"c":"#ff9800","s":"round","d":"主に愛媛県で栽培され、香り甘み共に豊か。明治時代には発見され普及が進められた。","v":true,"p1":12,"p2":34},
{"k":73,"n":"佐賀果試35号","a":["にじゅうまる"],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":112,"p2":84},
{"k":74,"n":"南津海","a":["なつみ"],"c":"#ff9800","s":"normal","d":"温州に似るが初夏でも美味しく食べられるみかん","v":true,"p1":46,"p2":15},
{"k":75,"n":"南香","a":[],"c":"#fc7f03","s":"round","d":"高い糖度と豊かな香りが特徴のオレンジ。温州みかんのように皮が薄くむきやすい","v":true,"p1":36,"p2":46},
{"k":76,"n":"口之津37号","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":8},
{"k":77,"n":"吉浦ポンカン","a":[],"c":"#ff9800","s":"round","d":null,"v":true,"p1":46,"p2":null},
{"k":78,"n":"地中海マンダリン","a":["ウィローリーフ"],"c":"#ff9800","s":"normal","d":"細長い葉の形状からWillow leaf (柳葉)の別名も持つ。ウィルキングの親となりその食味を子へ伝えた","v":true,"p1":null,"p2":null},
{"k":79,"n":"大分果研4号","a":["ゼリーオレンジ","サンセレブ"],"c":"#ff9800","s":"normal","d":"果汁の多く果肉の柔らかいのが特徴の高級柑橘。減酸が早く年内収穫ができる","v":true,"p1":83,"p2":82},
{"k":80,"n":"大将季","a":[],"c":"#fc9003","s":"deko","d":"不知火に似るが赤色が濃く、濃厚な甘味と程よい酸味の高級柑橘。鹿児島県で生まれ発見者の大野さんとその息子さんの将季さんから名付けられた。","v":true,"p1":69,"p2":null},
{"k":81,"n":"大橘","a":["サワーポメロ"],"c":"#ffe01d","s":"round","d":"酸味が強くさっぱりとした大型柑橘。主に加工用に用いられることが多い","v":true,"p1":92,"p2":null},
{"k":82,"n":"大津８号","a":["大分果研４号"],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":100,"p2":null},
{"k":83,"n":"天草","a":[],"c":"#ff9800","s":"normal","d":"甘味と酸味のバランスが良く、ジューシーで香り豊かな高級柑橘","v":true,"p1":6,"p2":45},
{"k":84,"n":"太田ポンカン","a":[],"c":"#ff9800","s":"round","d":null,"v":true,"p1":46,"p2":null},
{"k":85,"n":"媛小春","a":[],"c":"#ffe01d","s":"round","d":"ジューシーな甘さと程よい酸味に黄金柑に似る香気。名前も可愛らしい小粒の黄色い柑橘","v":true,"p1":99,"p2":118},
{"k":86,"n":"宮川早生","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":100,"p2":null},
{"k":87,"n":"小原紅早生","a":[],"c":"#e65100","s":"normal","d":"日本一赤いと言われる温州みかん。濃厚な甘味が特徴","v":true,"p1":86,"p2":null},
{"k":88,"n":"山下紅早生","a":[],"c":"#e65100","s":"normal","d":null,"v":true,"p1":86,"p2":null},
{"k":89,"n":"弓削瓢柑","a":[],"c":"#ffe01d","s":"egg","d":"ひょうたんのような形をした文旦系柑橘。爽やかな香りと酸味、ほろ苦さが特徴","v":true,"p1":117,"p2":62},
{"k":90,"n":"愛媛果試28号","a":["紅まどんな","愛果28号"],"c":"#ff9800","s":"normal","d":"ゼリーのようなぷるぷる食感、高貴な芳香と濃厚な甘味の高級柑橘","v":true,"p1":83,"p2":75},
{"k":91,"n":"愛媛果試48号","a":["紅プリンセス"],"c":"#ff9800","s":"normal","d":"紅まどんなの滑らかな食感と甘平の濃厚な甘さを引き継いだ高級柑橘。2005年から20年の月日を経て2025年3月に本格的な販売が始まった","v":true,"p1":90,"p2":107},
{"k":92,"n":"文旦","a":["ポメロ"],"c":"#ff9800","s":"normal","d":"主に高知県で栽培される甘酸っぱい大型柑橘。土佐文旦、水晶文旦、サワーポメロなどの総称","v":true,"p1":null,"p2":null},
{"k":93,"n":"新甘夏","a":["サンフルーツ"],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":106,"p2":null},
{"k":94,"n":"日向夏","a":["ニューサマーオレンジ","小夏"],"c":"#ffe01d","s":"round","d":"アルベドにも甘味のある宮崎の柑橘。爽やかな甘味と香り","v":true,"p1":95,"p2":58},
{"k":95,"n":"橘","a":[],"c":"#ff9800","s":"normal","d":"日本固有の柑橘で、平安時代から常緑樹で縁起がいいとされた。現在は絶滅危惧種","v":true,"p1":null,"p2":null},
{"k":96,"n":"河内晩柑","a":[],"c":"#ffe01d","s":"round","d":"和製グレープフルーツとも呼ばれるジューシーでさっぱりとした柑橘","v":true,"p1":89,"p2":68},
{"k":97,"n":"津之望","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":111},
{"k":98,"n":"津之輝","a":[],"c":"#ff9800","s":"normal","d":"アンコールの芳香と濃厚な甘みを持つ。β-クリプトキサンチンを多く含有する。","v":true,"p1":3,"p2":8},
{"k":99,"n":"清見","a":["清見タンゴール"],"c":"#ff9800","s":"normal","d":"オレンジとみかんの間の『タンゴール』代表種。現代の高級柑橘の多くはここから生まれる","v":true,"p1":86,"p2":36},
{"k":100,"n":"温州みかん","a":[],"c":"#ff9800","s":"normal","d":"日本の冬の代名詞。400年以上前に鹿児島で誕生","v":true,"p1":108,"p2":17},
{"k":101,"n":"湘南ゴールド","a":[],"c":"#ffe01d","s":"round","d":"神奈川県で生まれた小粒で黄色い柑橘。爽やかで果汁香り共に豊かな品種","v":true,"p1":118,"p2":71},
{"k":102,"n":"湘南の香","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":9},
{"k":103,"n":"無核紀州","a":[],"c":"#ff9800","s":"normal","d":"紀州みかんから種がほとんどできないように品種改良された小みかん","v":true,"p1":108,"p2":null},
{"k":104,"n":"瑞季","a":[],"c":"#ffe01d","s":"deko","d":"水晶文旦とサザンイエローの交配種。種が少なく甘味が強い晩生柑橘。","v":true,"p1":21,"p2":92},
{"k":105,"n":"瓢柑","a":[],"c":"#ffe01d","s":"egg","d":"現代で瓢柑といえば弓削瓢柑を指すが、遺伝学の上では別柑橘としている。","v":true,"p1":17,"p2":64},
{"k":106,"n":"甘夏","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":37,"p2":null},
{"k":107,"n":"甘平","a":[],"c":"#ff9800","s":"flat","d":"シャキシャキとした粒感と高い糖度、扁平な見た目の愛媛が誇る高級柑橘","v":true,"p1":112,"p2":46},
{"k":108,"n":"紀州みかん","a":["キシュウミカン"],"c":"#ff9800","s":"normal","d":"江戸時代の主力品種。小ぶりで濃厚な甘味","v":true,"p1":null,"p2":null},
{"k":109,"n":"紅甘夏","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":106,"p2":null},
{"k":110,"n":"興津46号","a":[],"c":"#ff9800","s":"round","d":null,"v":true,"p1":25,"p2":36},
{"k":111,"n":"興津早生","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":86,"p2":null},
{"k":112,"n":"西之香","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":36},
{"k":113,"n":"西南のひかり","a":[],"c":"#fc7f03","s":"normal","d":"糖度が高く酸度の低い高級柑橘。β-クリプトキサンチンの含有量が多く免疫昨日のサポートとしても優秀","v":true,"p1":2,"p2":115},
{"k":114,"n":"農6","a":["カンキツ中間母本農6号"],"c":"#ff9800","s":"normal","d":"興津の果樹試験場にて生まれた品種。貯蔵性が高く、ゆっくり減酸させることで本来のポテンシャルである高い糖度を楽しめる","v":true,"p1":16,"p2":103},
{"k":115,"n":"陽香","a":[],"c":"#ff9800","s":"normal","d":null,"v":true,"p1":99,"p2":70},
{"k":116,"n":"青島温州","a":[],"c":"#ff9800","s":"normal","d":"静岡県で発見された晩生温州。スーパーなどでもよく見かける代表品種","v":true,"p1":100,"p2":null},
{"k":117,"n":"鳴門オレンジ","a":["鳴門"],"c":"#ffe01d","s":"round","d":"徳島県で発見された黄色い柑橘。甘味と酸味のバランスが良い。アルベドまで甘みがあるので、皮ごと食べられることもある","v":true,"p1":108,"p2":66},
{"k":118,"n":"黄金柑","a":[],"c":"#ffe01d","s":"round","d":"小粒ながら香りよく甘味の濃縮した黄色い柑橘","v":true,"p1":100,"p2":53}
]
$catalog$::jsonb;
begin
  create temporary table _mikan_source (
    source_key integer primary key,
    name text not null,
    aliases text[] not null,
    color text not null,
    shape text not null,
    description text,
    is_visible boolean not null,
    parent1_key integer,
    parent2_key integer
  ) on commit drop;

  insert into _mikan_source (source_key, name, aliases, color, shape, description, is_visible, parent1_key, parent2_key)
  select
    (item->>'k')::integer,
    item->>'n',
    array(select jsonb_array_elements_text(item->'a')),
    item->>'c',
    item->>'s',
    nullif(item->>'d', ''),
    (item->>'v')::boolean,
    nullif(item->>'p1', '')::integer,
    nullif(item->>'p2', '')::integer
  from jsonb_array_elements(catalog) item;

  create temporary table _mikan_map (
    source_key integer primary key,
    id uuid not null
  ) on commit drop;

  insert into _mikan_map (source_key, id)
  select
    source.source_key,
    coalesce(
      (
        select variety.id
        from public.mikan_varieties variety
        where variety.name = source.name or variety.name = any(source.aliases)
        order by case when variety.name = source.name then 0 else 1 end
        limit 1
      ),
      gen_random_uuid()
    )
  from _mikan_source source;

  insert into public.mikan_varieties (id, name, aliases, color, shape, description, is_visible)
  select map.id, source.name, source.aliases, source.color, source.shape, source.description, source.is_visible
  from _mikan_source source
  join _mikan_map map on map.source_key = source.source_key
  on conflict (id) do update set
    aliases = excluded.aliases,
    color = excluded.color,
    shape = excluded.shape,
    description = excluded.description,
    is_visible = excluded.is_visible;

  update public.mikan_varieties variety
  set
    parent1_id = parent1.id,
    parent2_id = parent2.id
  from _mikan_source source
  join _mikan_map map on map.source_key = source.source_key
  left join _mikan_map parent1 on parent1.source_key = source.parent1_key
  left join _mikan_map parent2 on parent2.source_key = source.parent2_key
  where variety.id = map.id;
end
$migration$;
