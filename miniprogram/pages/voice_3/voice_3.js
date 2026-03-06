// pages/voice_1/voice_1.js
const tencentTTS = require('../../utils/tencentTTS');

Page({
  data: {
    currentPage: 0,
    isPlaying: false,
    isSynthesizing: false,
    audioContext: null,
    showSettings: false,
    showNav: false,
    showCatalog: false,
    isDarkMode: false,
    sunIconUrl: '',
    moonIconUrl: '',
    voicePlayIconUrl: '',
    settingsIconUrl: '',
    catalogIconUrl: '',
    isFlipping: false,
    flipPageIndex: 0,
    nextPageIndex: 0,
    statusBarHeight: 0,
    
    // 触摸相关
    touchStartX: 0,
    touchStartY: 0,
    
    // 阅读设置
    fontSize: 30,
    lineHeightValue: 18,
    lineHeight: 1.8,
    marginSize: 40,
    brightness: 100,
    flipMode: 'slide',
    flipAnimation: '',
    fontFamily: 'STKaiti',
    contentStyle: '',
    
    fontList: [
      { name: '宋体', value: '宋体' },
      { name: '汇文明朝', value: '汇文明朝' },
      { name: '正楷体', value: '正楷体' },
      { name: '华文楷体', value: 'STKaiti' },
      { name: '老宋体', value: '老宋体' },
      { name: '霞鹜文楷', value: 'LXGW WenKai' },
      { name: '方正楷体', value: '方正楷体' },
      { name: '默认', value: 'sans-serif' }
    ],
    
    pages: [
      {
        title: "一九三五年一月二十九日 晴",
        content: "晨七时出发，经和场、卧滩坝，晚在习水场宿营，行程一百十里。听说前面红三军团在土城同龙云军阀激战，我们都想快点赶上去参战。"
      },
      {
        title: "一月三十日 晴",
        content: "晨七时出发，到桥西宿营，行程一百十里。我和师卫生处长张杰等同志在中央纵队和红一军团后面做收容工作。按上级指示，为了轻装前进，部队将多余的枪支以及大炮、印刷机等笨重物品，都丢入赤水河。赤水河啊，赤水河！我们红军在中央苏区缴获的重机枪、大炮、印刷机和又光机，都暂时寄存你的河底，请你好生保管，到我们革命取得胜利那天，再来起货和追谢。"
      },
      {
        title: "二月一日 阴雨",
        content: "师政派我同吴富善跟三团打赤水县城。这次北行的目的，听说是争取在泸州附近抢渡长江，力争打下叙山、江安，到川北同四方面军会合，战士们听了可高兴哪！师政宣传队在赤水河一带扩红十二名，都给一团。我们于晨七时出发，经赛场到王河口宿营，行程九十里。都是石头路，实在难行。在赛场碰到从重庆逃回家的三个国民党士兵，有人说是侦探，要枪毙。赤水河两岸工农都用背篓，一个人能背八九十斤。"
      },
      {
        title: "二月三日 阴",
        content: "晨七时出发，在赤水河东岸朝北行进，经湖沟场、大山、白鹤滩、养猪场到大金沙场镇宿营，行程百余里。沿途小石子路实在难走，二营六连的许多战士，脚上都打起了泡。大金沙场镇较大，有居民四百五十户。我们在那里打了三家土豪，缴了些盐巴，暂时解决了部队和老百姓的吃盐困难。宣传队在大屋基扩红四名。刘湘的川军在大金沙场抢粮、抓人，被我们打跑了。"
      },
      {
        title: "二月四日 晴",
        content: "上午九时出发，经白场达旺隆场宿营，行程九十里。四家土豪都跑了。这里距赤水城九十里，如能打下赤水城，消灭刘湘军阀一两个师，那就在川南打开了一个缺口，到川北就方便了。"
      },
      {
        title: "二月五日 晴",
        content: "师政首长要我带巡视员刘锦平等同志跟三团出发攻打赤水，沿途搞好宣传扩红工作，并给部队解决些经费。晨七时由旺隆场出发，经大白田、马窝头、后清到火坪子，遇敌机袭击，山高林多，战士、干部们隐蔽在山上休息。午后二时继续行军，经磨爷山、桐子坡到赤水河支流、地塘、桃竹岩一带宿营，行程六十里。沿途工农热心参军，各连扩红很多，这是好事。"
      },
      {
        title: "二月六日 阴雨",
        content: "上午八时出发，途遇敌机轰炸扫射。部队营、连间隔距离太大，继续前进。经桃竹岩、曹家沟、柏子园，看到地主家养了几只猴子，有钱人寻开心。到车岗场休息，这是个大镇。聂参谋长、李师长、黄政委到三团，交待今晚袭占赤水县的任务。午后继续行军，三团一营为前卫，经复兴场、青龙嘴、尖兵到新草房，突然发现刘湘军阀部队，我先头部队展开战斗，抢占了猴子坝、校马湾高地。打了半天，把敌人打了下去，歼敌两个营，缴枪数百支，机枪数挺，迫击炮数门。不一会，敌人又疯狂反击，我方伤亡五十余人。师首长下令撤退，回复兴场大教堂处理伤员，审问俘虏得知，蒋介石纠集二十万大军，拼凑百余架飞机，妄想在赤水河、土城一带消灭红军。"
      },
      {
        title: "二月七日 晴",
        content: "早晨到新桥，第一次过赤水河，回师政，向谭主任汇报战斗及处理伤员情形。三团特派员袁纪录同志，福建人，重伤后安置在英口山岩村。他不愿留下，最后抱住我的腿说，萧主任，你千脆把我打死吧！战友啊！我们要行军，实在无法，只好含泪离别。"
      },
      {
        title: "二月八日 雾天",
        content: "上午九时出发，经前后胡坝、大金滩，在土城第二次过赤水河，到桂花场宿营，行程九十里。上级指示，要各团把笨重的东西再次投入赤水河，轻装战斗。我们围着赤水河打转，用以迷惑敌人，隐蔽我军战略意图，同敌人打圈子。在师政看到了党中央、中央军委昨天发布的告全体红色战士书，号召红军在运动中消灭敌人，为创造黔滇川边根据地而斗争。告全体红色战士书主要内容是，为了有把握地求得胜利，我们必须寻找有利的时机与地区去消灭敌人。在不利条件下，我们应该杜绝那种冒险的没有胜利把握的战斗。因此，红军必须经常的转移作战地区，有时向东，有时向西，有时走大路，有时走小路，有时走老路，有时走新路，而唯一的目的是为了在有利条件下取得作战的胜利。"
      },
      {
        title: "二月九日 晴雾",
        content: "晨七时出发，向西经向家寨、桃校坝、五丘田，从石坎子第三次渡赤水河，在观音岩休息。午后二时继续出发，经罗家沟、天池、熊凡、下河口到缩金宿营，行程九十里。今天在三团，途中与龙云军阀遭遇，战后同师部失去联系，敌人从后而赶来，枪炮不停，连声喊杀，满天云雾，又没有地图，分不清东西南北。我三团找不到师主力，真危险！师首长早说过，万一向上级失去联系，就独立行动，举起革命旗帜，坚持苏维埃事业，等联络上后再北上抗日。"
      },
      {
        title: "二月十日 晴",
        content: "晨七时出发，经坪子头到新房子休息。我同师政宣传科长彭家伦等同志打了两家土豪，扩红八名。午后二时又继续出发，经马优、薛吉到顺江场和二郎滩一带，第四次过赤水河，晚达顺风宿营，行程九十里。敌人已经围堵上来，我们地形不熟悉，同敌人穿梭行动，幸而找上了师部。林参谋长、部队忽然向东行动。摸上级意图才知道，为了突破敌人的大包围，毛主席当机立断，决定暂缓执行北渡长江计划，改在黔滇川边实行机动作战，命令部队向云南扎西（今威信）地区集结，等各路敌军逼近时，红军突然向东进，甩开敌人。"
      },
      {
        title: "二月十一日 阴雨",
        content: "上午八时出发，经石坝、傅家湾、虾蟆口，在田竹林大休息。我们去察看地形，发现周围已被龙云的滇军占领。天气很糟糕，满天大雾，我们接连打下几个山头，过了很多村子，但同师部又失去了联系。午后二时又出发，经板坡在芭蕉窝过赤水河支流，到大湾宿营，行程九十里。这是云南省扎西地区，一天跑两省，走得够累。这一带尽是山岭和树木，看不清方向，地主武装到处喊杀，群众都跑光了。听说中央军委总部在扎西，九军团向南行动。我们在这里东转西转，把白军搞得很分散，使他们摸不着红军的方向，难以组织新的围堵计划。"
      },
      {
        title: "二月十二日 阴",
        content: "上午八时从大湾出发，经瓜果、扎子门往东走，到林口宿营，又回到了贵州省境，行程六十五里。"
      },
      {
        title: "二月十三日 晴",
        content: "上午八时从林口出发，经观文，在观园街第五次渡赤水河，到白河宿营，行程一百二十里。土城以南的赤水河，水很浅，随时可以过来过去。这次同师部失去联系后，我们团领导研究决定，要求同志们团结起来，准备独立作战。什么时候和上级联系上，就什么时候归队。没有地图，我们呼到哪里抢炮响，就往那里奔找。因为打仗的地方，就有我们的部队。结果，敌人发现了我们，合拢过来，哇哇乱叫，我们坚决反击，战斗到天黑，因伤亡较大，只好撤下来。这一带无水，把人渴坏了，我和几个同志在一个脏水坑里喝污水，为了解渴，也不觉得腥臭。团政委黑夜掉入深坑，我们把他拉起来，继续行军。"
      },
      {
        title: "二月十四日 阴",
        content: "部队东转西转找了三天，还没有和上级联系上，连枪炮声也听不见了，我们决心打着红旗前进。晨七时出发，向东南方向行动，经共场在尖芦场、茅台一带第六次过赤水河，到水口寺宿营，行程百余里。"
      },
      {
        title: "二月十五日 阴",
        content: "上午九时出发，十一点钟左右，终于在中杠（今仁怀）横发现了一团路标，大家高兴极了。经半天急行军，于午后三时找到红一团，和师部联系上了。他们说，这几天敌人那么多，地形那么复杂，你们独立作战真不容易啊！我们开玩笑说，其是老天爷有眼，白军也奈何不了我们。"
      },
      {
        title: "二月十六日 雨",
        content: "晨七时出发，我跟一团二营七连行军，经前头场、沙湾到君子溪、高桥一带宿营，行程九十里。这地方是小盆地，很富饶，打了几家土豪。我们找到了土豪藏在地窖里的牛肉、腊肉，一部分分给了群众，一部分拿来供应部队。"
      },
      {
        title: "二月二十日 阴",
        content: "军团命令部队原地休息。中午，我在高桥参加全师营以上干部会。会议由谭主任主持，黄楚政委传达党中央一月在遵义开的政治局扩大会议精神，指出自一九三一年以后，尤其是第五次反“围剿”以来，机会主义认为敌人过于强大，“围剿”根本不能粉碎，在军事行动上是保守主义、拼命主义，折损了红军主力，最后又是逃跑主义，丢掉了中央苏区，来了个大搬家。遵义会议指出，我们虽然受到损失，但中国的工农革命还是在前进，我们的许多有利条件依然存在，敌人方面的矛盾与困难大大增加了，我们的困难，在全体同志努力之下，是可以克服的。听完传达后，分组讨论了两天，广大干部对机会主义者错误指挥造成的损失很不满，有的气得直冒火。上级指出，主要是总结经验，不要过多责备个人。我们贯彻遵义会议精神，就是要在党中央、毛主席的领导下，高举苏维埃的红旗，克服困难，搞好创建黔滇川边苏区的工作，执行北上抗日方针。"
      },
      {
        title: "二月二十二日 阴雨",
        content: "黄楚政委根据两天来的讨论，解答了很多问题，并表示坚决拥护毛主席回到领导岗位上来，坚决拥护军委组成三人小组统帅全军，渡过难关，走向胜利。大家听后精神振奋，纷纷表示要打回遵义去，消灭国民党反动派，为创建黔滇川边苏区而英勇战斗。"
      },
      {
        title: "二月二十六日 阴雨",
        content: "部队准备打回遵义去，师政首长要我同金行生跟三团行动，检查一下传达遵义会议精神后部队的反映，以及连队支部的活动情况。晨七时出发，经大园子、青岗坡、上淡沟到铜梓城宿营，行程九十里。这次回铜梓，精神面貌大不一样，抗日救国的目的更明确了。薛岳纵队围追堵截，并企图在长江南岸消灭红军。敌人又在做梦。我们又转到贵州建立根据地，不过长江了。听说蒋介石在贵阳督战，我们的口号是：“打到贵阳去，活捉蒋介石、王家烈！”"
      },
      {
        title: "二月二十八日 阴雨",
        content: "部队在铜梓县各战，红二师已向遵义城开进，战士们憧憬遭敌机轰炸，一团伤四名，三团伤六名，二团亡三名。战士们奋勇前进，经曾家院、杨柳院、严家院进到羊角场。王家烈匪军已占领野猫洞、老虎洞、朝天洞一带高地，经过激战，我军已扼在醉、吴纵队前面，控制了遵义城。"
      },
      {
        title: "三月四日 阴",
        content: "师政首长要我负责战地后勤，协同遵义县苏维埃政府搞担架。这带群众热爱红军，积极帮助安置伤员。师政首长说，军委决定全野战部队利用遵义有利地势，集中全力向醉、吴纵队和王家烈匪军发起猛攻。干部团在陈庚团长、宋任穷政委率领下，在城西南凤凰山一带，项在醉、吴纵队进攻，夺夺遵义西南高地。三军团也在红花岗一带阻击。午后敌攻势更猛。李聚奎师长、黄楚政委在全师战斗动员大会上说，这场战斗一定要打好，而且能打好，因为敌人都装入我们的大口袋了。我师准备在遵义东侧严家湾、沙子河一线投入左侧反击，协同红二师由左侧打到乌江桥，要打乱醉、吴纵队的指挥中心。这是遵义会议以来红军打的第一个好战役，我们信心都很足。担架队源源不断上前线，各级后勤保证工作较前好，战士、干部负伤后有保障,战斗格外勇敢。"
      },
      {
        title: "三月五日 晴",
        content: "午，师部在严家湾村外的一棵大树下召开团以上干部紧急会议，由师政谭主任传达一份机密电报，即毛主席、周副主席、朱总司令今天在瞿溪下达的遵义战役命令。其中指出：我军有首先消灭萧、谢两师之任务。一军团及干部团为右纵队，于明六日拂晓取道花苗田向干长山、枫香坝之间攻击。其第一师，应绕至倒流水、李村地域，突击敌后尾。以红二师向肯坑地域之敌侧击。干部团随红二师前进，受军团率、左指挥。三军团为左纵队，以主力三个团经温水沟绕过温水大山西端，从倒流水、肯坑、养马水向南向北攻击，以一个团扼守九龙山、白鹿坎，正面吸引敌人东进。并以小部至太平场以南迂回牵制敌师。五军团为总预备队，进至白鹿坎附近待命。还规定通讯联络除用无线电随时报告战况外，再烧烟火：大胜利烧三堆，小胜利烧两堆，大相持或不利烧一堆。谭主任传达完毕，要各团政治处将上述精神迅速传达到连队去，并要我向吴富善、金行生跟三团行动，协同工作。我红一师午后二时从遵贵公路上投入战斗，昼夜不停，穿迫猛打，不给敌人以喘息机会，坚决粉碎醉、吴主力的进攻，保证巩固遵义，争取时间整顿部队。"
      },
      {
        title: "三月六日 晴",
        content: "红一至团在公路东侧，分两路齐头并进，强行军迂回包围乌江桥。我红一师昨晚八时许从白河镇向西猛追到鸭溪镇，行程一百二十里。逃敌十分疲劳，我们冲上去，敌人乖乖地当了俘虏。接战报，我红二师夜间向乌江桥敌后迂回，打到醉、吴纵队指挥中心，搅乱了白鹿指挥系统。敌人被俘虏后还蒙在鼓里。天还未亮，二师把乌江桥一堵，白鹿连桥带跳，掉在河里，淹死不计其数。这一仗消灭敌人三千多，俘醉、吴纵队三个先头师打垮了一半。我同金行生、吴富善跟三团八连指战员们冲松子竹，只见沿途敌人七斜八歪地死睡着。三排谢排长灵机一动，吹哨集合，敌人像蒙蒙睡睡爬起来，半死不活来集合。谢排长一手抓住敌连长，悄悄告诉他：“你已当了俘虏，快命令部队缴枪！”结果，八十五个敌人乖乖地当了俘虏。红军总部已移遵义城。我团王有才营长带七连继续前进，钻入白腊坎。这里是敌教导七旅二十一团，那些鹤片兵不吸鹤片走不动。他们都躺在那里舒舒服服地睡觉。有的还在吸牛，说红军离这里还远着呢！他们万万没有想到，不一会却成了红军的俘虏。"
      },
      {
        title: "三月六日 晴",
        content: "这次，我七连俘敌七百多人，缴获了很多粮食、猪肉。天亮向贵阳方向派出督战，部队分享胜利品。这使我师共消灭敌人千余人，缴获了一辆汽车和一张比例为五万分之一的地图。这地图有云、贵至天全、芦山的路线，真是个宝，我军早就盼望有这么张地图了。师部又给我团调来一位有文化的缮写员，名叫杨永松，很年轻，福建永定人。三营营长王有才带来两百多俘虏兵。四连战士也很英勇，俘敌一百多人。郭庭柱报告，据初步统计，三团伤一百二十人，亡二十四人，俘敌七百余人，缴获枪支两百多，除老弱病残者外，可挑选两百多人补充部队。这带群众孤俘虏房和缴枪也不少，由苏维埃政府自行处理。继续行军到鸭溪镇，区苏维埃政府游击队来联系，把二十多名伤病员交给他们。这一带地方建立了好几个苏维埃政府，并设有小型医院，接受部队伤病员，干部、战士都很高兴。穷人很愿当红军，没多久就扩红百余名。这里发展苏区很有希望。"
      },
      {
        title: "三月七日 晴",
        content: "晨，全师部队整装待发。接军团令，部队第三次回遵义。我们经午庄桥进城，行程七十里。入城时，军委直属队来欢迎，并搭了个凯旋门。晚问师政，住在东关野猫洞。"
      },
      {
        title: "三月八日 雨",
        content: "上午九时，方面军在遵义中学召集团以上干部开会。总政李富春代主任致开幕词。他说，我们党中央在遵义召开了政治局扩大会议，这个会议是中国革命的转折点。党中央在周恩来、朱德、王稼样等同志的坚决支持下，确立了毛主席的领导地位，撤换了“左”倾路线的领导者。毛泽东同志挺身而出，在极端困难条件下，挽救了革命，挽救了党，挽救了红军。并提出在黔、滇、川边创建抗日反蒋苏维埃根据地。遵义战役是毛主席、周副主席、朱总司令今亲自指挥的，打败了王家烈军阀二十一个团，击垮了薛岳纵队先头部队两个整编师，共消灭敌人七千余，缴获枪千余支。在党中央、毛主席领导下，转入了黔、滇、川广大无垠区，开展了游击战、运动战，占领了以遵义为中心的南到乌江边，北靠赤水河的广大地区。"
      },
      {
        title: "三月八日 雨",
        content: "接着，三军团彭德怀和五军团董振堂军团长等首长也讲了话，大意是：遵义战斗的胜利，是我军在党中央和毛主席的领导下，发扬勇猛顽强的战斗作风所取得的。要把薛、吴纵队赶到贵阳城去，打得他长期翻不了身。我们红军是钢铁汉，红军的两条腿能跑过敌人的汽车轮。要继续发展苏区，在遵义附近广泛开展游击活动，以巩固遵义根据地，争取更大胜利。大会在雄壮的《国际歌》声中结束。晚上会了餐，我和两个警卫员跟罗梦柴、陈磨、邓小平、谭政、杨得志、林龙发等首长一桌，连端了两盆红烧猪肉，吃得真痛快！谭主任要我找同金行生跟三团行动。该团易旁湘总支书记有病，要我帮助三团政治处工作，我深入九连了解彭连长打人事。战士反映，彭连长脾气不好，一着急就骂人。检查后向林龙发政委汇报，决定由林政委找他谈话，进行批评教育，限期改正。彭连长知错，表示要改正，大家很欢迎。"
      },
      {
        title: "三月九日 晴",
        content: "晨七时出发，经香坝、白场沟到万喜场宿营，行程七十里。红军又向西行动，看样子又要插到川南，打乱敌人部署，使我军可从宜宾附近渡长江到川北去。师政召开部务会议，由秘书周胜南同志将遵义会议上通过的关于反对敌人五次“围剿”的总结决议，原原本本地传达了一遍，大家认真地进行了学习讨论，一致认为这个总结决议很好，对机会主义的批判很深刻。"
      },
      {
        title: "三月十日 晴",
        content: "我随三团二连行动。一营刘兴隆营长生病，通讯员陈忠梅照顾很周到。二连现有七十六人，其中党员十八人，团员二十人。我们边走边传达遵义会议精神，战士情绪较稳定，对转圈子可以理解了，东走西转是为了打好仗，消灭敌人。三营扩红八名，这带穷人多，好扩红。当地群众周庭宾、杨锡庭给我们当向导，走了一天不愿回去了，谈话后，留在三团二连当战士。九连三班长符辉球，江西人，十八岁，一路扩红二十一名，要大力表扬。三连班长雷伍平，福建人，二十一岁，一路扩红十八名。他用自己的苦难经历，说明参加红军的必要性，效果较好。四连党支部在行军大休息时召开支委会，批评二排胡排长工作方式生硬，不能以理服人。经过思想斗争，他的工作方法有所改进。作为一个干部，越是在困难的时候，越要关心战士，有问题要多做政治思想工作，只能说服，不能强迫命令。谭主任召开部务会议，传达总政发布的通知和布告。"
      },
      {
        title: "三月十日 晴",
        content: "通知说，红军是有严格纪律的军队，不拿群众一点东西，借群众的东西要还，买卖按照市价，如发现侵犯群众利益的行为，可到政治部来控告。布告的内容有：红军所到之处，绝对保护工人、贫民的利益，对工人，主张实行八小时工作制，增加工资；对农民，主张不交租，不纳税，不还债，没收地主土地，分配给农民；对于苗族等少数民族，主张民族自决，民族平等，与汉族工农享受同等待遇，反对汉族地主的压迫；对于白军士兵，欢迎他们带枪来当红军，参加工农革命；对于城市乡镇商人，其安分守己者，亦准于自由营业。"
      },
      {
        title: "三月十一日 阴、大雾",
        content: "上午八时出发，经石坝子到亮岩宿营，行程八十里。沿途打了几家土豪，将没收来的衣、被装备部队，浮财分给群众。扩红二十名。我们沿赤水河南北交叉行动，敌人以为我们要渡长江。敌薛、吴纵队从贵阳往北追来，龙云军阀已调三个旅，在黔北阻击红军，企图在凉山消灭红军，那是作梦。"
      },
      {
        title: "三月十二日 阴",
        content: "晨出发，经清水铺到摩泥宿营，行程七十五里。这一带树木多，敌机发现不了我们。二连邓连长脚跌伤，弄不好又要就地安置。我们一路行军、打仗、宣传、就地安置伤病员，都是撒革命的种子。扎西附近还成立了党的边界特委。我们行军识字做得好，七连班长刘新文一天行军识字十二个，就是那个打圈子的“圈”字难写，我看先易后难总可学会。二排长说，明天把认字牌换成“渡河”吧，每天都要渡河，把这两个字先学会。"
      },
      {
        title: "三月十六日 晴",
        content: "晨出发，经河场，绕过扎西，达鲁测鸡宿营，行程八十里。鲁班场驻有龙云军阀一个旅，红一、二师子傍晚发起进攻，因敌人修起了工事，作了充分准备，激战三小时，未奏效，撤出战斗，伤亡八十余人。谭主任要我们协助各团积极扩大红军，帮助扎西特委开展苏维埃运动，要抢给抢，既要拿出抢杆子，又要发展抢杆子。"
      },
      {
        title: "三月十七日 时阴时晴",
        content: "军团决定在这里休整几天，安置伤员，擦拭武器，扩红，打土豪，筹粮款，做点衣服。敌机不断来侦察、扫射、轰炸，七连二人受伤，二排长崔米成同志牺牲。连队开追悼会，大家向烈士默哀致敬。"
      },
      {
        title: "三月十八日 阴",
        content: "军团货，军委指示，停止向西北行动，九军团向毕节行动，用以迷惑敌人，让蒋介石以为我军又要从宜宾过长江。王（家烈）、刘（湘）、龙（云）各军阀在遵义以西，扎西以东的长江南岸拼命做工事，组织新的围堵，军委指示一军团在三月二十六日以前从草木、九庄向抢渡乌江，向贵阳前进，把川南的围堵敌军甩开。师政首长要我们巡视团随三团行动。我们从鄂家渡第八次过赤水河，由北到南，折转指向贵阳行动，到固亨、林口宿营，行程九十里。沿途看到三个区苏维埃政府的牌子，大家都很高兴。三连扩红七名，担架队扩红九名，全团半月共扩红一百二十名，成绩很大。我们向各连党、团支部传达了南下抢占乌江的决定。讨论时有人提起，去年冬渡乌江时，处分了两个怕死鬼。那两人明明会游泳，关键时刻却不愿当水手，结果都受到了纪律的制裁。为了革命，就要不怕牺牲。"
      },
      {
        title: "三月十九日 阴晴",
        content: "云贵高原气候不好，时冷时热。我随三团一营为前卫。在通场到特务连了解情况，该连有一百零五人，其中党员四十五人，团员三十五人，是人数较多的一个连。电话班长谢古军说，毛主席就是站得高，看得远，如果不是毛主席英明指挥，我们这些人可能早在长江喂王八了。警卫班长钟实辉说，一天走个百儿八十里路是小事，但转圈子受不了，一下东，一下西，像梭子似的，哪有个头？北上抗日什么时候到？晨出发，经安洛向乌江前进，行程一百二十里。在江口梯子岩驻王家烈一个营，有七、八条船，江面水流较缓慢，南岸是悬崖陡壁。一营化装成王家烈部队，二连半夜出发，七十五人心雄胆壮奔向乌江。如化装巧渡不成，便转入强攻，一定要从九庄渡过乌江，打到贵阳去。"
      },
      {
        title: "三月二十日 晴",
        content: "据师通报，蒋介石亲到贵阳督战，敌人新的进攻又开始了。他们想以乌江为屏障，组织新的合围圈，企图消灭我军。昨天，红一团在以北河上，打垮王家烈两个团的侧击，消灭白军两个营，俘敌六百多人。凌晨五时出发，跟三团一营急行军，经二十里铺、岩场到后坝场、鸡溪镇宿营，行程百余里。战士问，怎么老是走，究竟走到哪里去？这说明我们政治动员工作做得不够深入。我们政治处要同连队一同走，边走边谈为什么要转圈子的道理，说明我们红军转一圈，走一步，白匪就要倾巢而出。要叫蒋介石乖乖地听我们毛主席的指挥。"
      },
      {
        title: "三月二十二日 晴",
        content: "我跟二营行动，经高溪场、沙土到浮水口、九庄渡口，行程百余里。我军巧装王家烈匪军渡江。从悬崖陡壁手抓藤条，攀登南岸。遇到守敌侧击，我军往勇战斗，终于登岸，将吴奇伟纵队一个营和王家烈军阀两个营打垮。在这次战斗中，我团十二名同志负伤，五名同志英勇牺牲。"
      },
      {
        title: "三月二十四日 晴",
        content: "三团已巩固登陆场，掩护全师和中央纵队、三军团、五军团过江。二营迁到黑城庙宿营，行程七十里。经过激战，将敌军侦察部队许灭，俘敌五十六名，其余往息烽县逃跑。一营在息密村打土豪两家，没收猪四头。三营的王有才率领九连最后归队，收容掉队战士二十名。宣传队沿途扩红四名，全营共扩红十七名。一、二团已向遵贵公路靠拢，打得蒋介石目瞪口呆。前几天他还说红军要过长江，今日红军可打到贵阳门口来了。"
      }
    ]
  },

  async onLoad() {
    console.log("离开苏区上征途页面加载");

    // 异步获取图片URL
    const [sunIconUrl, moonIconUrl, voicePlayIconUrl, settingsIconUrl, catalogIconUrl] = await Promise.all([
      getApp().getImageUrl('太阳.png'),
      getApp().getImageUrl('月亮.png'),
      getApp().getImageUrl('语音播放-.png'),
      getApp().getImageUrl('设置.png'),
      getApp().getImageUrl('目录.png')
    ]);

    // 获取系统信息，设置状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;

    this.updateContentStyle();

    // 从缓存读取主题模式
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({
      isDarkMode,
      statusBarHeight,
      sunIconUrl,
      moonIconUrl,
      voicePlayIconUrl,
      settingsIconUrl,
      catalogIconUrl
    });
  },

  // 使用腾讯云TTS进行语音合成
  async toggleVoice() {
    if (this.data.isSynthesizing) {
      wx.showToast({
        title: '正在合成语音，请稍候...',
        icon: 'none'
      });
      return;
    }

    if (this.data.isPlaying) {
      // 停止播放
      this.stopAudio();
    } else {
      // 开始播放
      await this.startAudio();
    }
  },

  // 开始音频播放
  async startAudio() {
    try {
      // 确保在开始新的音频播放前停止之前可能正在播放的音频
      this.cleanupAudioContext();
      
      this.setData({ isSynthesizing: true });
      
      wx.showLoading({
        title: '正在合成语音...',
        mask: true
      });

      const currentText = this.data.pages[this.data.currentPage].content;
      
      // 使用腾讯云TTS合成语音，设置returnAllBlocks=true以获取所有音频块
      const audioData = await tencentTTS.synthesizeWithTencent(
        currentText,
        tencentTTS.VOICE_TYPES.narrator, // 使用叙述者音色
        0, // 语速
        0, // 音量
        'neutral', // 情感
        true // 返回所有音频块，确保完整播放整页内容
      );

      this.setData({
        isPlaying: true,
        isSynthesizing: false
      });

      wx.hideLoading();
      wx.showToast({
        title: '开始播放语音',
        icon: 'success'
      });

      // 创建一个临时的音频上下文数组来保存所有播放的音频上下文
      this.audioContexts = [];
      
      // 修改playAudioBlocks的调用方式，传入回调函数来保存音频上下文
      try {
        // 自定义播放音频块的方法，确保能管理音频上下文
        await this.playAudioBlocksWithControl(audioData);
        // 所有音频块播放完成
        this.setData({ isPlaying: false });
        console.log('所有音频块播放完成');
      } catch (playError) {
        console.error('音频块播放失败:', playError);
        this.setData({ isPlaying: false });
        wx.showToast({
          title: `音频播放失败: ${playError.message}`,
          icon: 'none'
        });
      }

    } catch (error) {
      console.error('腾讯云TTS合成失败:', error);
      this.setData({ isSynthesizing: false });
      wx.hideLoading();
      wx.showToast({
        title: `语音合成失败: ${error.message}`,
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 自定义的音频块播放方法，支持音频控制
  playAudioBlocksWithControl(audioBlocks) {
    return new Promise((resolve, reject) => {
      // 处理可能的对象类型输入
      let actualAudioBlocks = audioBlocks;
      if (audioBlocks && typeof audioBlocks === 'object' && audioBlocks.audioBlocks) {
        actualAudioBlocks = audioBlocks.audioBlocks;
      }
      
      if (!actualAudioBlocks || !Array.isArray(actualAudioBlocks) || actualAudioBlocks.length === 0) {
        reject(new Error('没有有效的音频块需要播放'));
        return;
      }
      
      let currentBlockIndex = 0;
      const tempFilePaths = [];
      
      // 递归播放每个音频块
      function playNextBlock() {
        // 检查是否已停止播放
        if (!this.data.isPlaying) {
          resolve(tempFilePaths);
          return;
        }
        
        if (currentBlockIndex >= actualAudioBlocks.length) {
          resolve(tempFilePaths);
          return;
        }
        
        console.log(`播放第${currentBlockIndex + 1}/${actualAudioBlocks.length}个音频块`);
        
        const fs = wx.getFileSystemManager();
        const tempFilePath = `${wx.env.USER_DATA_PATH}/tencent_audio_${Date.now()}_${currentBlockIndex}.mp3`;
        const blockData = actualAudioBlocks[currentBlockIndex];
        
        // 确保数据类型正确
        if (typeof blockData !== 'string') {
          console.error(`第${currentBlockIndex + 1}个音频块数据类型错误:`, typeof blockData);
          reject(new Error(`第${currentBlockIndex + 1}个音频块数据类型错误，期望字符串`));
          return;
        }
        
        fs.writeFile({
          filePath: tempFilePath,
          data: blockData,
          encoding: 'base64',
          success: () => {
            tempFilePaths.push(tempFilePath);
            // 创建音频上下文播放当前文件
            const audioContext = wx.createInnerAudioContext();
            audioContext.src = tempFilePath;
            
            // 保存音频上下文到数组
            this.audioContexts.push(audioContext);
            
            audioContext.onEnded(() => {
              // 从数组中移除已播放完成的音频上下文
              const index = this.audioContexts.indexOf(audioContext);
              if (index > -1) {
                this.audioContexts.splice(index, 1);
              }
              
              // 检查是否已停止播放
              if (!this.data.isPlaying) {
                resolve(tempFilePaths);
                return;
              }
              
              currentBlockIndex++;
              playNextBlock.call(this);
            });
            
            audioContext.onError(error => {
              console.error(`第${currentBlockIndex + 1}个音频块播放失败:`, error);
              reject(new Error(`音频播放失败: ${error.errMsg}`));
            });
            
            audioContext.play();
          },
          fail: (error) => {
            console.error(`第${currentBlockIndex + 1}个音频块保存失败:`, error);
            reject(error);
          }
        });
      }
      
      // 开始播放第一个块
      playNextBlock.call(this);
    });
  },

  // 播放音频
  playAudio(audioPath) {
    // 先清理可能存在的音频上下文
    this.cleanupAudioContext();
    
    // 创建新的音频上下文
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = audioPath;
    
    audioContext.onPlay(() => {
      console.log('开始播放音频');
    });

    audioContext.onEnded(() => {
      console.log('音频播放结束');
      this.setData({ isPlaying: false });
      this.cleanupAudioContext();
    });

    audioContext.onError((error) => {
      console.error('音频播放错误:', error);
      this.setData({ isPlaying: false });
      wx.showToast({
        title: `音频播放失败: ${error.errMsg}`,
        icon: 'none'
      });
      this.cleanupAudioContext();
    });

    // 增加播放进度监听，帮助调试
    audioContext.onTimeUpdate(() => {
      // 每5秒记录一次播放进度
      if (Math.floor(audioContext.currentTime) % 5 === 0 && !this.lastProgressLog || 
          Math.floor(audioContext.currentTime) > this.lastProgressLog + 5) {
        console.log(`当前播放进度: ${audioContext.currentTime.toFixed(1)}s / ${audioContext.duration ? audioContext.duration.toFixed(1) : '未知'}s`);
        this.lastProgressLog = Math.floor(audioContext.currentTime);
      }
    });

    audioContext.play();
    this.audioContext = audioContext;
    this.lastProgressLog = 0;
  },

  // 清理音频资源的通用方法
  cleanupAudioContext() {
    // 清理单个音频上下文
    if (this.audioContext) {
      try {
        // 检查audioContext是否已被销毁
        if (this.audioContext.paused !== undefined) {
          this.audioContext.stop();
        }
        this.audioContext.destroy();
      } catch (error) {
        console.warn('清理单个音频上下文时出错:', error);
      } finally {
        this.audioContext = null;
        this.lastProgressLog = null;
      }
    }
    
    // 清理音频上下文数组（用于playAudioBlocksWithControl方法）
    if (this.audioContexts && Array.isArray(this.audioContexts)) {
      this.audioContexts.forEach(audioContext => {
        try {
          if (audioContext && audioContext.paused !== undefined) {
            audioContext.stop();
            audioContext.destroy();
          }
        } catch (error) {
          console.warn('清理音频上下文数组中的项时出错:', error);
        }
      });
      this.audioContexts = null;
    }
  },

  // 停止音频播放
  stopAudio() {
    // 首先设置isPlaying为false，这样播放队列中的下一个音频块就不会继续播放
    this.setData({ isPlaying: false });
    
    // 清理所有音频上下文
    this.cleanupAudioContext();
    
    wx.showToast({
      title: '停止播放',
      icon: 'none'
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 触摸开始
  onTouchStart(e) {
    if (this.data.showSettings) return;
    this.setData({
      touchStartX: e.touches[0].pageX,
      touchStartY: e.touches[0].pageY
    });
  },

  // 触摸结束
  onTouchEnd(e) {
    if (this.data.showSettings) return;
    
    const touchEndX = e.changedTouches[0].pageX;
    const touchEndY = e.changedTouches[0].pageY;
    const deltaX = touchEndX - this.data.touchStartX;
    const deltaY = Math.abs(touchEndY - this.data.touchStartY);
    
    // 判断是否为水平滑动
    if (Math.abs(deltaX) > 50 && deltaY < 50) {
      if (deltaX > 0) {
        // 向右滑动 - 上一页
        this.prevPage();
      } else {
        // 向左滑动 - 下一页
        this.nextPage();
      }
    } else if (Math.abs(deltaX) < 30 && deltaY < 30) {
      // 点击屏幕中间区域显示/隐藏导航栏
      const windowWidth = wx.getSystemInfoSync().windowWidth;
      const tapX = e.changedTouches[0].pageX;
      
      if (tapX > windowWidth * 0.3 && tapX < windowWidth * 0.7) {
        this.toggleNav();
      }
    }
  },

  // 切换导航栏显示
  toggleNav() {
    this.setData({
      showNav: !this.data.showNav
    });
  },

  // 更新内容样式
  updateContentStyle() {
    const { brightness } = this.data;
    const filter = `brightness(${brightness}%)`;
    this.setData({
      contentStyle: `filter: ${filter};`
    });
  },

  // 翻页动画
  performPageFlip(direction, targetPage) {
    if (this.data.flipMode === 'none') {
      this.setData({ currentPage: targetPage });
      return;
    }

    const flipPageIndex = this.data.currentPage;
    const nextPageIndex = targetPage;
    
    this.setData({
      isFlipping: true,
      flipPageIndex: flipPageIndex,
      nextPageIndex: nextPageIndex,
      flipAnimation: direction === 'next' ? 'flip-right' : 'flip-left'
    });

    setTimeout(() => {
      this.setData({
        currentPage: targetPage,
        isFlipping: false,
        flipAnimation: ''
      });
    }, 600);
  },

  // 下一页
  nextPage() {
    if (this.data.currentPage < this.data.pages.length - 1) {
      const targetPage = this.data.currentPage + 1;
      
      if (this.data.flipMode === 'simulation') {
        this.performPageFlip('next', targetPage);
      } else if (this.data.flipMode === 'slide') {
        this.setData({ flipAnimation: 'page-slide-left' });
        setTimeout(() => {
          this.setData({ 
            currentPage: targetPage,
            flipAnimation: '' 
          });
        }, 300);
      } else if (this.data.flipMode === 'cover') {
        this.setData({ flipAnimation: 'page-fade' });
        setTimeout(() => {
          this.setData({ 
            currentPage: targetPage,
            flipAnimation: '' 
          });
        }, 200);
      } else {
        this.setData({ currentPage: targetPage });
      }
    }
  },

  // 上一页
  prevPage() {
    if (this.data.currentPage > 0) {
      const targetPage = this.data.currentPage - 1;
      
      if (this.data.flipMode === 'simulation') {
        this.performPageFlip('prev', targetPage);
      } else if (this.data.flipMode === 'slide') {
        this.setData({ flipAnimation: 'page-slide-right' });
        setTimeout(() => {
          this.setData({ 
            currentPage: targetPage,
            flipAnimation: '' 
          });
        }, 300);
      } else if (this.data.flipMode === 'cover') {
        this.setData({ flipAnimation: 'page-fade' });
        setTimeout(() => {
          this.setData({ 
            currentPage: targetPage,
            flipAnimation: '' 
          });
        }, 200);
      } else {
        this.setData({ currentPage: targetPage });
      }
    }
  },

  // 进度条改变
  onProgressChange(e) {
    const percent = e.detail.value;
    const targetPage = Math.round((percent / 100) * (this.data.pages.length - 1));
    this.setData({ currentPage: targetPage });
  },

  // 设置相关方法
  toggleSettings() {
    this.setData({
      showSettings: !this.data.showSettings
    });
  },

  // 目录相关方法
  toggleCatalog() {
    this.setData({
      showCatalog: !this.data.showCatalog
    });
  },

  jumpToPage(e) {
    const targetPage = e.currentTarget.dataset.index;
    if (targetPage !== this.data.currentPage) {
      this.setData({
        currentPage: targetPage,
        showCatalog: false
      });
    } else {
      this.setData({
        showCatalog: false
      });
    }
  },

  // 主题切换方法
  toggleTheme() {
    const newMode = !this.data.isDarkMode;
    this.setData({
      isDarkMode: newMode
    });
    
    // 保存到缓存
    wx.setStorageSync('isDarkMode', newMode);
    
    // 切换页面根元素的 class
    if (newMode) {
      // 夜间模式
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });
    }
    
    wx.showToast({
      title: newMode ? '已切换到夜间模式' : '已切换到日间模式',
      icon: 'none',
      duration: 1000
    });
  },

  onBrightnessChange(e) {
    this.setData({ brightness: e.detail.value });
    this.updateContentStyle();
  },

  onFontSizeChange(e) {
    this.setData({ fontSize: e.detail.value });
  },

  onMarginChange(e) {
    this.setData({ marginSize: e.detail.value });
  },

  onLineHeightChange(e) {
    const value = e.detail.value;
    this.setData({
      lineHeightValue: value,
      lineHeight: value / 10
    });
  },

  changeFlipMode(e) {
    this.setData({
      flipMode: e.currentTarget.dataset.mode
    });
  },

  changeFontFamily(e) {
    this.setData({
      fontFamily: e.currentTarget.dataset.font
    });
  },

  onUnload() {
    // 页面卸载时安全清理音频资源
    this.cleanupAudioContext();
  }
});