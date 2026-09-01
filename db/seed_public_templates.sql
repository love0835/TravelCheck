-- 公用模板 seed（由 tools/extract-seed.mjs 自動產生，請勿手改）
-- 來源：legacy/v260901n.html 的 DATA 陣列
-- 重跑本檔會先刪掉舊的公用模板再重建。

delete from templates where is_public;

-- 最優先｜一週前完成
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'pri', '最優先｜一週前完成', 'bolt', 'todo', '這幾件沒做，人可能出不了門，<br>或到了當地寸步難行。', true, false, true, 0);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('台胞證效期確認'::text, '過期就上不了飛機'::text, '{"red":1}'::jsonb, 0),
  ('確認旅平險／不便險的起訖時點'::text, '終期要蓋過實際落地時間'::text, '{"red":1}'::jsonb, 1),
  ('逐一確認電器是否 100–240V'::text, '中國 220V，只寫 110V 會燒掉'::text, '{}'::jsonb, 2),
  ('支付寶綁台灣信用卡＋實名認證'::text, '落地才辦會卡簡訊驗證'::text, '{}'::jsonb, 3)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'pri';

-- 出發前｜一週前預約
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'book', '出發前｜一週前預約', 'calendar', 'todo', '這些都要排隊或需要恢復期。<br>臨時才約，通常約不到。', false, false, true, 1);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('髮型整理'::text, '抓一週前才自然'::text, '{}'::jsonb, 0),
  ('臉部護理'::text, '別排在出發前一兩天'::text, '{}'::jsonb, 1),
  ('美甲、修眉'::text, null::text, '{}'::jsonb, 2),
  ('慢性病回診拿藥'::text, '拿足天數再多幾天'::text, '{"red":1}'::jsonb, 3),
  ('牙齒檢查或洗牙'::text, '旅途中牙痛最難處理'::text, '{}'::jsonb, 4),
  ('眼鏡或隱形眼鏡補貨'::text, '算足天數多備幾副'::text, '{}'::jsonb, 5),
  ('按摩、推拿'::text, '走很多路前先鬆開'::text, '{}'::jsonb, 6),
  ('寵物保姆預約'::text, '熱門時段要早訂'::text, '{"pet":1}'::jsonb, 7),
  ('寵物洗澡預約'::text, '出發前幾天洗好'::text, '{"pet":1}'::jsonb, 8),
  ('寵物健康檢查或拿藥'::text, '慢性藥備足天數'::text, '{"pet":1}'::jsonb, 9)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'book';

-- 出發前｜48 小時確認
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'prep3', '出發前｜48 小時確認', 'clock', 'todo', '太早看的天氣預報不準。<br>這一次才是有用的那一次。', false, false, true, 2);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('航班時間有無異動'::text, '改點常只發簡訊'::text, '{}'::jsonb, 0),
  ('線上劃位'::text, '開放當下就要選，晚了坐不在一起'::text, '{"red":1}'::jsonb, 1),
  ('託運額度確認'::text, null::text, '{}'::jsonb, 2),
  ('再看一次天氣'::text, null::text, '{}'::jsonb, 3),
  ('住宿訂單有效、房型沒被改'::text, null::text, '{}'::jsonb, 4),
  ('入住時間告知飯店'::text, '未通知可能被取消'::text, '{}'::jsonb, 5),
  ('確認飯店可用台胞證登記'::text, '小旅館可能不收境外旅客'::text, '{}'::jsonb, 6),
  ('飯店地址存簡體中文一份'::text, null::text, '{}'::jsonb, 7)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'prep3';

-- 隨身
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'carry', '隨身', 'bag', 'item', '以下全部不託運。下方空白欄可自行填寫個人常用藥。', false, false, true, 3);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('帽子'::text, null::text, '{}'::jsonb, 0),
  ('薄外套或防風外套'::text, '機艙冷，不可託運'::text, '{}'::jsonb, 1),
  ('長褲（磁吸褲腳）'::text, null::text, '{}'::jsonb, 2),
  ('好穿脫的鞋'::text, null::text, '{}'::jsonb, 3),
  ('襪子'::text, '機上脫鞋時穿'::text, '{}'::jsonb, 4),
  ('大絲巾或圍巾'::text, '可當薄毯或遮光'::text, '{"f":1}'::jsonb, 5),
  ('護照'::text, null::text, '{}'::jsonb, 6),
  ('台胞證'::text, null::text, '{}'::jsonb, 7),
  ('台灣身分證'::text, null::text, '{}'::jsonb, 8),
  ('登機證、訂房紙本'::text, null::text, '{}'::jsonb, 9),
  ('錢包、信用卡'::text, null::text, '{}'::jsonb, 10),
  ('證件影本紙本'::text, '與正本分開放'::text, '{}'::jsonb, 11),
  ('手機＋手機掛繩'::text, null::text, '{}'::jsonb, 12),
  ('口罩'::text, '多備幾個'::text, '{}'::jsonb, 13),
  ('口香糖'::text, '起降耳壓'::text, '{}'::jsonb, 14),
  ('筆'::text, '填單用'::text, '{}'::jsonb, 15),
  ('小包衛生紙'::text, null::text, '{}'::jsonb, 16),
  ('頸枕'::text, null::text, '{}'::jsonb, 17),
  ('眼罩'::text, null::text, '{}'::jsonb, 18),
  ('耳塞'::text, null::text, '{}'::jsonb, 19),
  ('有線耳機'::text, '機上娛樂系統是 3.5mm'::text, '{}'::jsonb, 20),
  ('藍牙耳機'::text, null::text, '{}'::jsonb, 21),
  ('眼藥水、人工淚液'::text, '機艙很乾'::text, '{}'::jsonb, 22),
  ('護唇膏'::text, null::text, '{}'::jsonb, 23),
  ('護手霜'::text, null::text, '{}'::jsonb, 24),
  ('小瓶保濕乳液或噴霧'::text, null::text, '{}'::jsonb, 25),
  ('濕紙巾'::text, null::text, '{}'::jsonb, 26),
  ('酒精棉片'::text, '擦餐桌板與扶手'::text, '{}'::jsonb, 27),
  ('塑膠手套'::text, null::text, '{}'::jsonb, 28),
  ('空水壺或保溫瓶'::text, '過安檢後裝水'::text, '{}'::jsonb, 29),
  ('水泡貼（人工皮）'::text, '當下就要貼'::text, '{}'::jsonb, 30),
  ('小零食'::text, null::text, '{}'::jsonb, 31),
  ('束腳帶（綁腿）'::text, '減少小腿腫脹'::text, '{}'::jsonb, 32),
  ('機上備用鞋'::text, '機上換穿'::text, '{}'::jsonb, 33),
  ('食物夾鏈袋'::text, '來不及吃的先收起來'::text, '{}'::jsonb, 34),
  ('髮圈、大髮夾'::text, null::text, '{"f":1}'::jsonb, 35),
  ('近視眼鏡'::text, null::text, '{}'::jsonb, 36),
  ('備用近視眼鏡＋硬殼盒'::text, null::text, '{}'::jsonb, 37),
  ('太陽眼鏡＋盒'::text, null::text, '{}'::jsonb, 38),
  ('隱形眼鏡盒＋小瓶藥水'::text, '上機前建議取下'::text, '{}'::jsonb, 39),
  ('眼鏡耳掛'::text, null::text, '{}'::jsonb, 40),
  ('軟鼻墊'::text, null::text, '{}'::jsonb, 41),
  ('小螺絲起子＋備用螺絲'::text, null::text, '{}'::jsonb, 42),
  ('度數處方拍照存手機'::text, null::text, '{}'::jsonb, 43),
  ('行動電源'::text, '只能隨身，需 3C＋BSMI'::text, '{}'::jsonb, 44),
  ('充電線'::text, null::text, '{}'::jsonb, 45),
  ('轉接頭'::text, null::text, '{}'::jsonb, 46),
  ('平板電腦'::text, null::text, '{}'::jsonb, 47),
  ('平板支架'::text, null::text, '{}'::jsonb, 48),
  ('耳機'::text, null::text, '{}'::jsonb, 49),
  ('多孔 USB 快充頭'::text, '多人共用一個插座'::text, '{}'::jsonb, 50),
  ('筆電'::text, '安檢要單獨拿出來，放最外層'::text, '{}'::jsonb, 51),
  ('安眠藥'::text, '原包裝＋處方'::text, '{}'::jsonb, 52),
  ('常用慢性藥'::text, null::text, '{}'::jsonb, 53),
  ('暈機藥、暈車暈船藥'::text, null::text, '{}'::jsonb, 54),
  ('腸胃藥'::text, null::text, '{}'::jsonb, 55),
  ('止痛藥'::text, null::text, '{}'::jsonb, 56),
  ('感冒藥、退燒藥'::text, null::text, '{}'::jsonb, 57),
  ('鼻塞噴劑'::text, '感冒時耳壓會痛'::text, '{}'::jsonb, 58),
  ('清涼藥膏'::text, null::text, '{}'::jsonb, 59),
  ('OK 蹦'::text, null::text, '{}'::jsonb, 60),
  ('皮膚藥膏'::text, null::text, '{}'::jsonb, 61),
  ('酸痛藥品'::text, null::text, '{}'::jsonb, 62),
  ('營養保健品'::text, null::text, '{}'::jsonb, 63),
  (''::text, null::text, '{"inp":1}'::jsonb, 64)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'carry';

-- 隨身｜防行程延誤包
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'lost', '隨身｜防行程延誤包', 'umbrella', 'item', null, false, false, true, 4);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('一套內衣褲'::text, null::text, '{}'::jsonb, 0),
  ('一件換洗上衣'::text, null::text, '{}'::jsonb, 1),
  ('迷你牙刷牙膏'::text, null::text, '{}'::jsonb, 2),
  ('洗面乳或洗臉巾幾片'::text, null::text, '{}'::jsonb, 3),
  ('隱形眼鏡當日份'::text, null::text, '{}'::jsonb, 4),
  ('一天份的藥'::text, null::text, '{}'::jsonb, 5)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'lost';

-- 託運｜3C 與通訊
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 't3c', '託運｜3C 與通訊', 'plug', 'item', null, false, false, true, 5);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('充電線多條'::text, null::text, '{}'::jsonb, 0),
  ('延長線'::text, null::text, '{}'::jsonb, 1),
  ('相機＋備用電池＋記憶卡'::text, null::text, '{}'::jsonb, 2),
  ('旅行攝影設備'::text, '腳架、穩定器、自拍棒、記憶卡'::text, '{}'::jsonb, 3),
  ('轉接頭'::text, null::text, '{}'::jsonb, 4),
  ('吹風機'::text, '亞朵酒店的還行，可以不帶'::text, '{}'::jsonb, 5),
  ('離子夾'::text, '先確認是否 100–240V'::text, '{"f":1}'::jsonb, 6),
  ('沖牙器'::text, null::text, '{}'::jsonb, 7),
  ('屁屁沖洗器'::text, null::text, '{}'::jsonb, 8),
  ('電話漫遊設定'::text, null::text, '{}'::jsonb, 9)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 't3c';

-- 託運｜盥洗
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'wash', '託運｜盥洗', 'drop', 'item', null, false, false, true, 6);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('個人盥洗專用包'::text, null::text, '{}'::jsonb, 0),
  ('牙刷'::text, null::text, '{}'::jsonb, 1),
  ('牙膏'::text, null::text, '{}'::jsonb, 2),
  ('牙線'::text, null::text, '{}'::jsonb, 3),
  ('棉花棒'::text, null::text, '{}'::jsonb, 4),
  ('漱口水'::text, null::text, '{}'::jsonb, 5),
  ('刮鬍刀'::text, null::text, '{"m":1}'::jsonb, 6),
  ('刮鬍泡'::text, null::text, '{"m":1}'::jsonb, 7),
  ('鼻腔清洗液'::text, null::text, '{}'::jsonb, 8),
  ('浴巾'::text, null::text, '{}'::jsonb, 9),
  ('毛巾'::text, null::text, '{}'::jsonb, 10),
  ('拖鞋'::text, null::text, '{}'::jsonb, 11),
  ('室內塑膠防水拖鞋'::text, null::text, '{}'::jsonb, 12),
  ('洗浴中心替換衣物'::text, null::text, '{}'::jsonb, 13),
  ('大包衛生紙'::text, null::text, '{}'::jsonb, 14),
  ('廚房紙巾'::text, null::text, '{}'::jsonb, 15),
  ('濕紙巾'::text, null::text, '{}'::jsonb, 16),
  ('酒精噴瓶'::text, null::text, '{}'::jsonb, 17),
  ('夾鏈袋（大量）'::text, null::text, '{}'::jsonb, 18),
  ('指甲剪'::text, null::text, '{}'::jsonb, 19),
  ('洗臉巾'::text, '過濾蓮蓬頭、卸妝兩用'::text, '{}'::jsonb, 20),
  ('髮束幾條'::text, '綁洗臉巾在出水口'::text, '{}'::jsonb, 21)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'wash';

-- 託運｜酒店衛生與安全
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'hotel', '託運｜酒店衛生與安全', 'shield', 'item', null, false, false, true, 7);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('一次性隔離膜膠帶組'::text, '遙控器、開關、門把、沖水鈕'::text, '{}'::jsonb, 0),
  ('大片塑膠隔髒組'::text, '可套在沙發與椅子'::text, '{}'::jsonb, 1),
  ('床包＋枕頭套'::text, null::text, '{}'::jsonb, 2),
  ('自己的枕頭'::text, '認床時值得帶'::text, '{}'::jsonb, 3),
  ('小薄被'::text, null::text, '{}'::jsonb, 4),
  ('睡眠用眼罩'::text, '專門放床頭'::text, '{}'::jsonb, 5),
  ('睡眠用耳塞'::text, '走廊聲音比想像中大'::text, '{}'::jsonb, 6),
  ('馬桶一次性坐墊'::text, null::text, '{}'::jsonb, 7),
  ('S 掛鉤 2–3 個'::text, '浴室房內都缺掛的地方'::text, '{}'::jsonb, 8),
  ('門檔'::text, '選有警報功能的'::text, '{}'::jsonb, 9),
  ('防火面罩'::text, '酒店應該也有'::text, '{}'::jsonb, 10),
  ('摺疊杯'::text, '取代房內杯具'::text, '{}'::jsonb, 11),
  ('乾淨垃圾袋'::text, null::text, '{}'::jsonb, 12)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'hotel';

-- 託運｜保養與化妝
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'care', '託運｜保養與化妝', 'bottle', 'item', null, false, false, true, 8);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('全套化妝品'::text, null::text, '{"f":1}'::jsonb, 0),
  ('卸妝用品'::text, null::text, '{"f":1}'::jsonb, 1),
  ('精華液'::text, null::text, '{"f":1}'::jsonb, 2),
  ('乳液'::text, null::text, '{}'::jsonb, 3),
  ('臉部保養品'::text, '化妝水、面膜、眼霜'::text, '{}'::jsonb, 4),
  ('護手霜'::text, null::text, '{}'::jsonb, 5),
  ('防曬乳'::text, null::text, '{}'::jsonb, 6),
  ('曬後修復凝膠'::text, null::text, '{}'::jsonb, 7),
  ('防蚊液'::text, null::text, '{}'::jsonb, 8),
  ('吸油面紙'::text, null::text, '{"f":1}'::jsonb, 9),
  ('痘痘貼'::text, null::text, '{}'::jsonb, 10),
  ('粉刺夾'::text, null::text, '{}'::jsonb, 11),
  ('好用的梳子'::text, '酒店的比較差'::text, '{}'::jsonb, 12),
  ('髮飾'::text, null::text, '{"f":1}'::jsonb, 13),
  ('大髮夾'::text, '也可夾窗簾縫'::text, '{"f":1}'::jsonb, 14)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'care';

-- 託運｜衣物
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'cloth', '託運｜衣物', 'shirt', 'item', '出發前查好當地日夜溫差，內陸與沿海差很多。', false, false, true, 9);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('睡衣 ×2'::text, '飯店普遍不提供'::text, '{}'::jsonb, 0),
  ('內衣褲多套'::text, null::text, '{}'::jsonb, 1),
  ('衛生棉'::text, null::text, '{"f":1}'::jsonb, 2),
  ('衛生護墊'::text, null::text, '{"f":1}'::jsonb, 3),
  ('泳衣、泳帽、泳鏡'::text, '大陸泳池多半強制戴泳帽'::text, '{}'::jsonb, 4),
  ('特殊襪子組（防腳痛）'::text, null::text, '{}'::jsonb, 5),
  ('薄長袖或薄毛衣'::text, '一定穿得到'::text, '{}'::jsonb, 6),
  ('防風防水外套'::text, null::text, '{}'::jsonb, 7),
  ('薄外套'::text, null::text, '{}'::jsonb, 8),
  ('厚外套'::text, '溫差大或秋冬行程'::text, '{}'::jsonb, 9),
  ('個人衣物搭配'::text, '依天數點清'::text, '{}'::jsonb, 10),
  ('帽子'::text, null::text, '{}'::jsonb, 11),
  ('折疊傘'::text, '一律託運'::text, '{}'::jsonb, 12),
  ('磁吸褲腳'::text, null::text, '{}'::jsonb, 13),
  ('針線包'::text, null::text, '{}'::jsonb, 14),
  ('備用鞋子'::text, '兩雙輪替才乾得了'::text, '{}'::jsonb, 15),
  ('減震鞋墊'::text, null::text, '{}'::jsonb, 16),
  ('壓力襪或小腿套'::text, '久走隔天差很多'::text, '{}'::jsonb, 17),
  ('輕便雨衣'::text, '騰不出手時用'::text, '{}'::jsonb, 18),
  ('折疊衣架 5–6 個'::text, null::text, '{}'::jsonb, 19),
  ('帶夾子衣架 2 個'::text, null::text, '{}'::jsonb, 20)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'cloth';

-- 託運｜極端天氣
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'cold', '託運｜極端天氣', 'snow', 'item', '一般行程遇到寒流或熱浪時用。<br>如果已經切到滑雪場景，那邊有更完整的清單。', false, false, true, 10);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('保暖手套'::text, '選觸控式的'::text, '{}'::jsonb, 0),
  ('防寒帽或毛帽'::text, '要蓋住耳朵'::text, '{}'::jsonb, 1),
  ('圍巾或脖圍'::text, '脖圍比圍巾好收'::text, '{}'::jsonb, 2),
  ('雪靴或防滑鞋'::text, '鞋底紋路要深'::text, '{}'::jsonb, 3),
  ('防水鞋套'::text, '套在一般鞋子外面'::text, '{}'::jsonb, 4),
  ('發熱衣褲'::text, '比多加一件外套有效'::text, '{}'::jsonb, 5),
  ('厚襪或羊毛襪'::text, '腳一冷整個人都冷'::text, '{}'::jsonb, 6),
  ('保暖褲襪或衛生褲'::text, null::text, '{}'::jsonb, 7),
  ('暖暖包'::text, '貼式握式各帶一些'::text, '{}'::jsonb, 8),
  ('護耳或防風面罩'::text, '零下加強風時有感'::text, '{}'::jsonb, 9),
  ('涼感巾'::text, '浸水後可以撐很久'::text, '{}'::jsonb, 10),
  ('攜帶式小電扇'::text, '高溫高濕時救命'::text, '{}'::jsonb, 11),
  ('電解質粉或鹽糖'::text, '大量流汗時補充'::text, '{}'::jsonb, 12)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'cold';

-- 場景｜高山健行
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'tmtn', '場景｜高山健行', 'mtn', 'item', '洋蔥式穿法：排汗底層＋保暖中層＋防風防水外層。<br>棉質衣物濕了會失溫，不要穿。', false, false, false, 11);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('登山鞋'::text, '要先穿開，新鞋一定起水泡'::text, '{}'::jsonb, 0),
  ('登山杖'::text, '一對比一支好'::text, '{}'::jsonb, 1),
  ('頭燈＋備用電池'::text, '雙手能空出來'::text, '{}'::jsonb, 2),
  ('防水防風外套'::text, '硬殼，擋雨擋風'::text, '{}'::jsonb, 3),
  ('保暖中層'::text, '刷毛或羽絨'::text, '{}'::jsonb, 4),
  ('排汗快乾衣'::text, '濕了會失溫，別穿棉'::text, '{}'::jsonb, 5),
  ('防曬帽與太陽眼鏡'::text, '高山紫外線很強'::text, '{}'::jsonb, 6),
  ('行動糧'::text, '巧克力、堅果、能量棒'::text, '{}'::jsonb, 7),
  ('高山症用藥'::text, '三千公尺以上先諮詢醫師'::text, '{}'::jsonb, 8),
  ('水袋或水壺'::text, '每小時抓 500ml'::text, '{}'::jsonb, 9),
  ('輕量背包＋背包雨套'::text, null::text, '{}'::jsonb, 10),
  ('綁腿'::text, '擋碎石與泥水'::text, '{}'::jsonb, 11),
  ('個人急救包'::text, '水泡貼、繃帶、止痛藥'::text, '{}'::jsonb, 12),
  ('離線地圖與紙本路線圖'::text, '山上沒訊號'::text, '{}'::jsonb, 13),
  ('哨子'::text, '受傷時求救用'::text, '{}'::jsonb, 14),
  ('保溫瓶'::text, null::text, '{}'::jsonb, 15)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'tmtn';

-- 場景｜海邊與潛水
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'tsea', '場景｜海邊與潛水', 'wave', 'item', '下水前 30 分鐘擦防曬，起水後補擦。<br>證件與電子產品全部進防水袋。', false, false, false, 12);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('泳衣、泳褲'::text, null::text, '{}'::jsonb, 0),
  ('防磨衣或水母衣'::text, '防曬也防水母'::text, '{}'::jsonb, 1),
  ('面鏡、呼吸管'::text, '租的常漏水'::text, '{}'::jsonb, 2),
  ('防水袋'::text, '手機證件都要放'::text, '{}'::jsonb, 3),
  ('防水手機殼'::text, null::text, '{}'::jsonb, 4),
  ('海灘拖鞋與膠底鞋'::text, '踩礁石要包覆鞋'::text, '{}'::jsonb, 5),
  ('速乾大浴巾'::text, null::text, '{}'::jsonb, 6),
  ('礁石友善防曬'::text, '部分海域禁用一般款'::text, '{}'::jsonb, 7),
  ('曬後修復凝膠'::text, null::text, '{}'::jsonb, 8),
  ('防水相機或運動攝影機'::text, null::text, '{}'::jsonb, 9),
  ('耳塞'::text, '耳道容易進水的人'::text, '{}'::jsonb, 10),
  ('潛水證照卡與潛水記錄本'::text, '要潛水才需要'::text, '{}'::jsonb, 11),
  ('暈船藥'::text, '上船前 30 分鐘吃'::text, '{}'::jsonb, 12),
  ('濕衣物防水收納袋'::text, null::text, '{}'::jsonb, 13)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'tsea';

-- 場景｜滑雪
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'tski', '場景｜滑雪', 'goggle', 'item', '雪具可租，貼身的東西一定要自備。<br>雪鏡、手套、雪襪租來的都不合用。', false, false, false, 13);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('雪衣、雪褲'::text, '看清楚防水係數'::text, '{}'::jsonb, 0),
  ('雪鏡'::text, '太陽眼鏡不夠用'::text, '{}'::jsonb, 1),
  ('安全帽'::text, '多數雪場強制'::text, '{}'::jsonb, 2),
  ('防水手套'::text, '一般手套一下就濕'::text, '{}'::jsonb, 3),
  ('雪襪'::text, '長筒厚襪一雙就好'::text, '{}'::jsonb, 4),
  ('面罩或脖圍'::text, '纜車上風最大'::text, '{}'::jsonb, 5),
  ('保暖內層衣褲'::text, '排汗材質'::text, '{}'::jsonb, 6),
  ('護具'::text, '初學者很需要'::text, '{}'::jsonb, 7),
  ('高係數防曬與護唇膏'::text, '雪地反射紫外線加倍'::text, '{}'::jsonb, 8),
  ('暖暖包'::text, null::text, '{}'::jsonb, 9),
  ('雪具租借預約'::text, '現場排隊很久'::text, '{}'::jsonb, 10),
  ('雪票或課程預約'::text, null::text, '{}'::jsonb, 11)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'tski';

-- 場景｜露營
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'tcamp', '場景｜露營', 'tent', 'item', '睡袋看清楚適用溫度，標示常比實際樂觀。<br>瓦斯罐不能搭飛機，要在當地買。', false, false, false, 14);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('帳篷＋營釘營槌'::text, null::text, '{}'::jsonb, 0),
  ('睡袋'::text, '看清楚適用溫度'::text, '{}'::jsonb, 1),
  ('睡墊或充氣床'::text, null::text, '{}'::jsonb, 2),
  ('頭燈與營燈'::text, null::text, '{}'::jsonb, 3),
  ('爐具與瓦斯罐'::text, '瓦斯罐不能搭飛機'::text, '{"red":1}'::jsonb, 4),
  ('鍋具與餐具'::text, null::text, '{}'::jsonb, 5),
  ('折疊桌椅'::text, null::text, '{}'::jsonb, 6),
  ('保冷袋或冰桶'::text, null::text, '{}'::jsonb, 7),
  ('防蟲液與蚊香'::text, null::text, '{}'::jsonb, 8),
  ('大型垃圾袋'::text, null::text, '{}'::jsonb, 9),
  ('雨具與地布'::text, null::text, '{}'::jsonb, 10),
  ('行動電源與延長線'::text, null::text, '{}'::jsonb, 11)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'tcamp';

-- 託運｜洗衣配套
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'laundry', '託運｜洗衣配套', 'washer', 'item', '行程長就一定要洗衣。<br>不洗的話，內衣褲數量會爆掉。', false, false, true, 15);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('洗衣相關'::text, '亞朵可洗烘並提供洗衣精'::text, '{}'::jsonb, 0),
  ('髒衣袋'::text, '亞朵洗衣房可拿'::text, '{}'::jsonb, 1),
  ('洗衣網袋'::text, '內衣褲襪子丟洗衣機用'::text, '{}'::jsonb, 2),
  ('伸縮晾衣繩'::text, '亞朵浴室裡有'::text, '{}'::jsonb, 3),
  ('自備衣架'::text, '就不用清潔酒店的'::text, '{}'::jsonb, 4)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'laundry';

-- 託運｜行李本體
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'lug', '託運｜行李本體', 'case', 'item', null, false, false, true, 16);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('行李箱安全束帶'::text, null::text, '{}'::jsonb, 0),
  ('備用行李袋'::text, null::text, '{}'::jsonb, 1),
  ('備用大手提包'::text, '回程裝伴手禮'::text, '{}'::jsonb, 2),
  ('備用隨身包'::text, '可折疊斜背，落地後當日常出門包'::text, '{}'::jsonb, 3),
  ('行李箱重量器'::text, '回程更用得到'::text, '{}'::jsonb, 4),
  ('行李鎖'::text, null::text, '{}'::jsonb, 5),
  ('行李識別貼或束帶'::text, '轉盤上一眼認出'::text, '{}'::jsonb, 6),
  ('小剪刀'::text, '隨身會被沒收'::text, '{}'::jsonb, 7),
  ('膠帶'::text, '封箱、補破、固定隔髒布'::text, '{}'::jsonb, 8),
  ('攜帶式折疊椅'::text, '排隊久站時'::text, '{}'::jsonb, 9),
  ('摺疊小坐墊'::text, '景點台階、候車'::text, '{}'::jsonb, 10),
  ('摺疊購物袋'::text, null::text, '{}'::jsonb, 11)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'lug';

-- 落地後當地購買
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'buy', '落地後當地購買', 'cart', 'item', '可直接用美團送到飯店。', false, false, true, 17);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('大瓶酒精'::text, '用完留在飯店'::text, '{}'::jsonb, 0)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'buy';

-- 出發前｜證件與資料
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'prep1', '出發前｜證件與資料', 'doc', 'todo', null, false, false, true, 18);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('證件拍照'::text, '證件、信用卡、機票、訂房、保單'::text, '{}'::jsonb, 0),
  ('存三處'::text, '手機、雲端、紙本'::text, '{}'::jsonb, 1),
  ('同行三人互存對方一份'::text, null::text, '{}'::jsonb, 2),
  ('眼鏡度數處方拍照'::text, null::text, '{}'::jsonb, 3),
  ('護照效期確認'::text, '轉機時會查'::text, '{}'::jsonb, 4)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'prep1';

-- 緊急資訊｜每人一份
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'sos', '緊急資訊｜每人一份', 'alert', 'todo', '卡片印兩份，一份放皮夾、一份放行李箱。<br>出事的當下，沒有人有空翻手機找資料。', false, false, true, 19);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('緊急醫療資訊卡'::text, '血型、過敏、慢性病、緊急聯絡人'::text, '{}'::jsonb, 0),
  ('常用藥的成分或學名'::text, '大陸藥名不同，講成分最快'::text, '{}'::jsonb, 1),
  ('過敏藥物寫清楚'::text, '寫清楚哪類藥、什麼反應'::text, '{}'::jsonb, 2),
  ('海基會 24 小時緊急服務專線'::text, '大陸撥 +886-2-2533-9995'::text, '{}'::jsonb, 3),
  ('大陸緊急電話'::text, '110 報警・120 急救・119 火警'::text, '{}'::jsonb, 4),
  ('保單號碼＋保險公司 24 小時電話'::text, null::text, '{}'::jsonb, 5),
  ('信用卡掛失電話'::text, '卡不見了就打不開 App'::text, '{}'::jsonb, 6),
  ('飯店名稱、簡體中文地址、電話'::text, '給司機或警察看'::text, '{}'::jsonb, 7),
  ('同行者聯絡方式與房號'::text, '互相都要有'::text, '{}'::jsonb, 8),
  ('家中緊急聯絡人'::text, null::text, '{}'::jsonb, 9),
  ('寵物保姆電話'::text, null::text, '{"pet":1}'::jsonb, 10),
  ('失聯的約定'::text, '講好集合點與時間'::text, '{}'::jsonb, 11),
  ('手機鎖定畫面設緊急聯絡人'::text, '鎖著也看得到'::text, '{}'::jsonb, 12),
  ('證件影本與卡片一起放'::text, '跟正本分開'::text, '{}'::jsonb, 13)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'sos';

-- 出發前｜銀行與通訊
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'prep2', '出發前｜銀行與通訊', 'wifi', 'todo', null, false, false, true, 20);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('通知銀行出國、開通海外交易'::text, '避免被風控鎖卡'::text, '{}'::jsonb, 0),
  ('微信支付綁卡'::text, '支付寶的備援'::text, '{}'::jsonb, 1),
  ('電話漫遊開通'::text, 'LINE／Google 才能用'::text, '{}'::jsonb, 2),
  ('下載高德地圖'::text, null::text, '{}'::jsonb, 3),
  ('下載大眾點評'::text, null::text, '{}'::jsonb, 4),
  ('下載滴滴出行'::text, null::text, '{}'::jsonb, 5),
  ('離線地圖下載'::text, null::text, '{}'::jsonb, 6),
  ('手機備份'::text, null::text, '{}'::jsonb, 7)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'prep2';

-- 出發前｜娛樂下載
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'fun', '出發前｜娛樂下載', 'music', 'todo', '落地後網路不一定順。<br>機上更是完全沒訊號。', false, false, true, 21);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('提早整理手機容量'::text, '照片影片先備份再刪，空間要夠'::text, '{"red":1}'::jsonb, 0),
  ('影片離線下載'::text, 'Netflix、Disney+ 等'::text, '{}'::jsonb, 1),
  ('音樂離線下載'::text, '先切離線模式測試過'::text, '{}'::jsonb, 2),
  ('Podcast、有聲書下載'::text, null::text, '{}'::jsonb, 3),
  ('電子書、小說下載'::text, null::text, '{}'::jsonb, 4),
  ('遊戲更新與離線模式確認'::text, '沒網路可能開不了'::text, '{}'::jsonb, 5),
  ('先挑好片單'::text, '十幾個小時，臨時挑很花時間'::text, '{}'::jsonb, 6),
  ('耳機充飽電'::text, null::text, '{}'::jsonb, 7),
  ('平板、電子書閱讀器充飽電'::text, null::text, '{}'::jsonb, 8)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'fun';

-- 出發前｜夥伴
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'prep4', '出發前｜夥伴', 'users', 'todo', null, false, false, true, 22);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('群組提醒：戴口罩、備妥常用藥、早睡'::text, null::text, '{}'::jsonb, 0),
  ('確認食物過敏'::text, null::text, '{}'::jsonb, 1),
  ('房型分配'::text, null::text, '{}'::jsonb, 2),
  ('分帳方式講清楚'::text, '誰先墊、怎麼結'::text, '{}'::jsonb, 3)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'prep4';

-- 出發前｜打包完成後
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'prep5', '出發前｜打包完成後', 'camera', 'todo', '不便險理賠要的就是這幾張照片。', false, false, true, 23);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('行李箱外觀拍照'::text, '正面＋側面'::text, '{}'::jsonb, 0),
  ('內容物全景拍照'::text, null::text, '{}'::jsonb, 1),
  ('貴重物品單拍＋保留發票'::text, null::text, '{}'::jsonb, 2)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'prep5';

-- 出發前｜家中清理
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'clean', '出發前｜家中清理', 'sparkle', 'todo', '這幾項不做，回家會很痛苦。', false, false, true, 24);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('清冰箱'::text, '生鮮與開封的清掉，製冰關掉'::text, '{}'::jsonb, 0),
  ('倒垃圾'::text, null::text, '{}'::jsonb, 1),
  ('廚餘單獨處理'::text, '最容易發臭生蟲'::text, '{}'::jsonb, 2),
  ('排水孔補水或封住'::text, '防反臭與蟑螂'::text, '{}'::jsonb, 3),
  ('洗衣機清空並掀蓋'::text, '留著濕衣服會發霉'::text, '{}'::jsonb, 4),
  ('除濕機、清淨機水箱倒空'::text, null::text, '{}'::jsonb, 5),
  ('冷氣濾網先清一次'::text, '要連續運轉，髒了不冷'::text, '{"pet":1}'::jsonb, 6),
  ('陽台盆栽、雜物固定'::text, '颱風季要固定'::text, '{}'::jsonb, 7),
  ('植物澆水'::text, null::text, '{}'::jsonb, 8)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'clean';

-- 出發前｜家中關閉與安全
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'home', '出發前｜家中關閉與安全', 'home', 'todo', null, false, false, true, 25);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('電子鎖或門鎖電池換新'::text, '沒電就進不了家'::text, '{}'::jsonb, 0),
  ('關瓦斯總開關'::text, null::text, '{}'::jsonb, 1),
  ('電與水不關'::text, '冷氣要 24 小時運轉'::text, '{"pet":1}'::jsonb, 2),
  ('拔掉不用電器插頭'::text, '電視、烘碗機、充電座'::text, '{}'::jsonb, 3),
  ('網路分享器保持開啟'::text, '攝影機要靠它'::text, '{"pet":1}'::jsonb, 4),
  ('關門窗'::text, null::text, '{}'::jsonb, 5),
  ('鎖房門'::text, '冷氣房不鎖'::text, '{}'::jsonb, 6),
  ('檢查通風與溫度'::text, null::text, '{}'::jsonb, 7),
  ('注意包裹到貨時間'::text, '確認出門前送達'::text, '{}'::jsonb, 8),
  ('暫停宅配、超商取貨改期'::text, '堆門口等於公告沒人'::text, '{}'::jsonb, 9),
  ('交代大樓管理員'::text, '代收包裹與緊急聯絡方式'::text, '{}'::jsonb, 10),
  ('信箱請人收'::text, null::text, '{}'::jsonb, 11),
  ('貴重物品收好'::text, null::text, '{}'::jsonb, 12),
  ('報備家人'::text, '行程、航班、住宿、回國時間'::text, '{}'::jsonb, 13)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'home';

-- 出發當天
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'dep', '出發當天', 'plane', 'todo', '依序執行。', false, true, true, 26);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('換新貓砂'::text, null::text, '{"pet":1}'::jsonb, 0),
  ('補水、補飼料'::text, null::text, '{"pet":1}'::jsonb, 1),
  ('設定冷氣 26–27°C'::text, '冷氣模式，不要除濕'::text, '{"pet":1}'::jsonb, 2),
  ('開連續運轉，關閉定時與睡眠模式'::text, null::text, '{"pet":1}'::jsonb, 3),
  ('檢查攝影機畫面'::text, null::text, '{"pet":1}'::jsonb, 4),
  ('逐間房目視確認貓的位置'::text, null::text, '{"pet":1}'::jsonb, 5),
  ('關好寵物門'::text, '別關在沒冷氣的房間'::text, '{"pet":1}'::jsonb, 6),
  ('鎖房門（冷氣房除外）'::text, null::text, '{}'::jsonb, 7),
  ('關門窗'::text, null::text, '{}'::jsonb, 8),
  ('關瓦斯'::text, null::text, '{}'::jsonb, 9),
  ('設定大門密碼'::text, '回國後記得刪掉'::text, '{}'::jsonb, 10),
  ('出門'::text, null::text, '{}'::jsonb, 11)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'dep';

-- 回程日
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'back', '回程日', 'back', 'todo', null, false, false, true, 27);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('行動電源放最好拿的位置'::text, '境內航班會查 3C'::text, '{}'::jsonb, 0),
  ('超過 100ml 一律託運'::text, null::text, '{}'::jsonb, 1),
  ('空水壺倒空'::text, null::text, '{}'::jsonb, 2),
  ('大瓶酒精留在飯店'::text, '小罐的 100ml 以內可以隨身'::text, '{}'::jsonb, 3),
  ('折疊傘放回託運'::text, null::text, '{}'::jsonb, 4),
  ('行李重新拍照'::text, null::text, '{}'::jsonb, 5),
  ('秤重'::text, null::text, '{}'::jsonb, 6)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'back';

-- 自駕｜證件
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'drive', '自駕｜證件', 'car', 'todo', '台灣駕照和國際駕照在大陸都不能直接開車，一定要先換證。', false, false, true, 28);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('台灣駕照正本'::text, '有效期不能過期'::text, '{}'::jsonb, 0),
  ('臨時機動車駕駛許可'::text, '短期用，不必筆試，限開租賃車'::text, '{}'::jsonb, 1),
  ('正式大陸駕駛證'::text, '體檢＋科目一筆試，效期 6 年'::text, '{}'::jsonb, 2),
  ('換證要帶的東西'::text, '台胞證、駕照、住宿登記、照片 2 張'::text, '{}'::jsonb, 3),
  ('先確認辦理地點'::text, '不是每個車管所都受理'::text, '{}'::jsonb, 4),
  ('租車與保險'::text, '看清楚自負額'::text, '{}'::jsonb, 5)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'drive';

-- 寵物｜出發前準備
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'cat', '寵物｜出發前準備', 'paw', 'todo', '家中電與水絕對不能關，冷氣要 24 小時運轉，只關瓦斯。<br>保姆一天只來一次，餵食節奏要靠機器補。', false, false, false, 29);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('自動餵食器設定 3–4 個時段'::text, null::text, '{}'::jsonb, 0),
  ('確認電池＋插電雙供電'::text, '跳電才不會停'::text, '{}'::jsonb, 1),
  ('罐頭或肉泥分裝、貼日期'::text, null::text, '{}'::jsonb, 2),
  ('多備 3 天份飼料'::text, null::text, '{}'::jsonb, 3),
  ('多備貓砂'::text, null::text, '{}'::jsonb, 4),
  ('飲水至少兩處'::text, '一處要不插電的碗'::text, '{}'::jsonb, 5),
  ('貓砂盆多開一盆'::text, null::text, '{}'::jsonb, 6),
  ('攝影機測試遠端'::text, null::text, '{}'::jsonb, 7),
  ('攝影機角度含冷氣出風口與常待位置'::text, null::text, '{}'::jsonb, 8),
  ('溫濕度計放在鏡頭可見處'::text, null::text, '{}'::jsonb, 9),
  ('智慧插座或冷氣伴侶'::text, '可遠端開關冷氣'::text, '{}'::jsonb, 10),
  ('循環扇'::text, '不要直吹'::text, '{}'::jsonb, 11),
  ('冷氣遙控器換新電池'::text, null::text, '{}'::jsonb, 12),
  ('玩具擺放'::text, '分散放'::text, '{}'::jsonb, 13),
  ('就醫資料備妥'::text, '放保姆看得到的位置'::text, '{}'::jsonb, 14),
  ('外出包'::text, '跟就醫資料放一起'::text, '{}'::jsonb, 15)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'cat';

-- 寵物｜保姆交代事項
insert into templates (is_public, slug, name, icon, kind, hint, hot, seq, default_on, sort_order) values
  (true, 'sitter', '寵物｜保姆交代事項', 'clip', 'todo', null, false, false, false, 30);
insert into template_items (template_id, title, note, flags, sort_order)
select t.id, v.title, v.note, v.flags, v.sort_order
from templates t
cross join (values
  ('大門臨時密碼'::text, '效期設為出國期間，回國刪掉'::text, '{}'::jsonb, 0),
  ('備用鑰匙或門禁卡'::text, null::text, '{}'::jsonb, 1),
  ('獸醫院名稱、電話'::text, null::text, '{}'::jsonb, 2),
  ('病史與用藥說明'::text, null::text, '{}'::jsonb, 3),
  ('跳電或冷氣故障的備案'::text, '開哪扇窗、哪台風扇'::text, '{}'::jsonb, 4),
  ('動線位置拍照標好'::text, '貓砂盆、飼料、飲水機'::text, '{}'::jsonb, 5),
  ('跟管理員說明保姆會進出'::text, null::text, '{}'::jsonb, 6)
) as v(title, note, flags, sort_order)
where t.is_public and t.slug = 'sitter';

-- 共 31 個公用模板、373 個項目
