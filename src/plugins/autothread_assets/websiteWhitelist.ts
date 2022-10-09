// From Alexa Top Websites (from https://www.expireddomains.net/alexa-top-websites/, accessed 2022-10-09)
// Modified by JaPNaA
const websiteWhitelist = new Set(`google.com
youtube.com
baidu.com
bilibili.com
facebook.com
qq.com
yahoo.com
twitter.com
zhihu.com
amazon.com
wikipedia.org
instagram.com
taobao.com
reddit.com
163.com
bing.com
linkedin.com
sina.com.cn
yandex.ru
xvideos.com
google.com.hk
vk.com
whatsapp.com
pornhub.com
jd.com
tiktok.com
csdn.net
t.co
live.com
github.com
canva.com
netflix.com
dzen.ru
alipay.com
douban.com
fandom.com
yahoo.co.jp
microsoft.com
sohu.com
amazon.in
aliexpress.com
xhamster.com
naver.com
weibo.com
tmall.com
mail.ru
1688.com
ebay.com
hao123.com
spankbang.com
pinterest.com
paypal.com
imdb.com
telegram.org
so.com
office.com
chaturbate.com
spotify.com
aliyun.com
xnxx.com
quora.com
apple.com
zoom.us
stackoverflow.com
msn.com
twitch.tv
myshopify.com
steampowered.com
duckduckgo.com
douyu.com
microsoftonline.com
google.co.in
360.cn
twimg.com
flipkart.com
sogou.com
youdao.com
etsy.com
iqiyi.com
t.me
cnblogs.com
amazon.co.uk
indeed.com
mega.nz
amazon.co.jp
deepl.com
adobe.com
pixiv.net
doubleclick.net
freepik.com
realsrv.com
smzdm.com
soso.com
imgur.com
mediafire.com
avito.ru
nih.gov
booking.com
dropbox.com
ali213.net
stripchat.com
bbc.com
ok.ru
wordpress.com
onlyfans.com
tencent.com
google.com.br
xiaohongshu.com
jianshu.com
nytimes.com
force.com
cnn.com
fiverr.com
medium.com
binance.com
discord.com
alibaba.com
gamersky.com
roblox.com
ilovepdf.com
tradingview.com
redd.it
hupu.com
walmart.com
rakuten.co.jp
udemy.com
huya.com
google.co.jp
battle.net
weather.com
researchgate.net
tumblr.com
instructure.com
hotstar.com
speedtest.net
chinaz.com
espn.com
y2mate.com
chase.com
w3schools.com
toutiao.com
douyin.com
fc2.com
quizlet.com
dcinside.com
google.fr
amazon.it
vimeo.com
tistory.com
amazonaws.com
google.cn
savefrom.net
linktr.ee
uol.com.br
notion.so
ozon.ru
primevideo.com
google.ru
shopify.com
grammarly.com
coinmarketcap.com
ifeng.com
autohome.com.cn
yandex.com
pconline.com.cn
zol.com.cn
bbc.co.uk
archive.org
shutterstock.com
epicgames.com
apple.com.cn
googlevideo.com
nexusmods.com
theguardian.com
behance.net
amazon.de
patreon.com
chess.com
amazon.ca
cloudflare.com
dmm.co.jp
godaddy.com
nicovideo.jp
zillow.com
178.com
slack.com
cloudfront.net
samsung.com
jb51.net
docin.com
upwork.com
wildberries.ru
animeflv.net
namu.wiki
dailymail.co.uk
bankofamerica.com
missav.com
state.gov
youku.com
deviantart.com
sxyprn.com
livejasmin.com
pixabay.com
eporner.com
amazon.fr
stackexchange.com
wetransfer.com
thepaper.cn
line.me
google.de
gitee.com
salesforce.com
doorblog.jp
investing.com
digikala.com
daum.net
tokyomotion.net
runoob.com
google.com.tw
blogger.com
gosuslugi.ru
bet365.com
pexels.com
jable.tv
cctv.com
yts.mx
51cto.com
feishu.cn
aliexpress.ru
book118.com
juejin.cn
amazon.es
hitomi.la
nhentai.net
mozilla.org
op.gg
quillbot.com
mydrivers.com
sciencedirect.com
google.ca
chegg.com
trendyol.com
zoho.com
ikea.com
xhamsterlive.com
livedoor.jp
zhibo8.cc
wiley.com
9gag.com
trello.com
pinimg.com
envato.com
coupang.com
hubspot.com
amazon.com.mx
shaparak.ir
foxnews.com
livedoor.biz
globo.com
guancha.cn
remove.bg
xxxxx520.com
ups.com
springer.com
target.com
daftsex.com
google.com.sg
snapchat.com
intuit.com
ddys.tv
hp.com
shopee.tw
soundcloud.com
shahed4u.town
office365.com
gstatic.com
1337x.to
stripe.com
wowhead.com
weibo.cn
fmkorea.com
ampproject.org
scribd.com
ria.ru
mangaraw.to
unsplash.com
hulu.com
istockphoto.com
lazada.sg
reverso.net
homedepot.com
dell.com
qidian.com
jav.guru
disneyplus.com
3dmgame.com
ya.ru
coursera.org
varzesh3.com
marca.com
geeksforgeeks.org
e-hentai.org
huawei.com
ea.com
futbin.com
goodreads.com
steamcommunity.com
gogoanime.dk
nvidia.com
dingtalk.com
wix.com
cnki.net
dailymotion.com
wp.pl
google.com.tr
usps.com
aparat.com
acfun.cn
dytt8.net
softonic.com
fast.com
figma.com
googlesyndication.com
4chan.org
noodlemagazine.com
gamer.com.tw
americanexpress.com
ouo.io
indiatimes.com
51job.com
mihoyo.com
zippyshare.com
flickr.com
shopee.co.id
tuitionpancake.com
gofile.io
meijutt.net
smallpdf.com
blog.jp
bdimg.com
mercadolibre.com.ar
btsow.cfd
healthline.com
aliexpress.us
nature.com
52pojie.cn
craigslist.org
hdfcbank.com
zendesk.com
directcpmrev.com
google.co.kr
sahibinden.com
porntrex.com
google.co.th
myanimelist.net
t66y.com
ruliweb.com
harshlygiraffediscover.com
zoukankan.com
fedex.com
tripadvisor.com
eastmoney.com
libvio.me
prawnsimply.com
xfinity.com
tampermonkey.net
rarbg.to
notifyoutspoken.com
biligame.com
sourceforge.net
oblongseller.com
360doc.com
google.com.mx
washingtonpost.com
google.com.sa
capitalone.com
nga.cn
thisvid.com
txxx.com
cambridge.org
myntra.com
youporn.com
bestbuy.com
wellsfargo.com
messenger.com
poki.com
onlinesbi.sbi
shimo.im
negotiationmajestic.com
cricbuzz.com
spellingunacceptable.com
xhamster18.desi
themeforest.net
aliyuncs.com
91porn.com
ameblo.jp
invaderannihilationperky.com
readmanganato.com
yuque.com
asus.com
tokopedia.com
shopee.co.th
wordpress.org
shopee.com.my
google.co.uk
mi.com
kakao.com
interesteddeterminedeurope.com
tnaflix.com
rt.com
2345.com
docomo.ne.jp
mit.edu
intimidatekerneljames.com
espncricinfo.com
asana.com
convertio.co
indiamart.com
genius.com
onet.pl
as.com
zhaopin.com
seatsrehearseinitial.com
battlenet.com.cn
yelp.com
ourhotposts.com
lenta.ru
dlsite.com
opensea.io
myworkdayjobs.com
meesho.com
gamewith.jp
hao6v.cc
artstation.com
iqbroker.com
tktube.com
skype.com
academia.edu
google.com.eg
divar.ir
arca.live
onlinedown.net
dood.wf
motivessuggest.com
cnbc.com
visualstudio.com
seznam.cz
kinopoisk.ru
1377x.to
oracle.com
speedtest.cn
eksisozluk.com
gmw.cn
infobae.com
wikihow.com
nike.com
lichess.org
google.com.au
pdfdrive.com
playstation.com
javhdporn.net
supjav.com
archiveofourown.org
cdninstagram.com
okta.com
coursehero.com
redtube.com
theporndude.com
discogs.com
amazon.cn
youjizz.com
qualtrics.com
blizzard.cn
accuweather.com
calendly.com
icourse163.org
erome.com
gismeteo.ru
shein.com
wikiwiki.jp
hepsiburada.com
alicdn.com
pearson.com
zhihuishu.com
reuters.com
shopee.vn
airbnb.com
codepen.io
internetdownloadmanager.com
inven.co.kr
hao6v.tv
uptodown.com
wise.com
icicibank.com
ca.gov
slideshare.net
ign.com
miguvideo.com
mailchimp.com
att.com
forbes.com
ithome.com
specialityharmoniousgypsy.com
zhipin.com
directcpmfwr.com
vatcalf.com
namecheap.com
bendibao.com
bitly.com
ghxi.com
moegirl.org.cn
leetcode.cn
noonoo.tv
dandanzan10.top
syosetu.com
doc88.com
costco.com
cocomanga.com
btnull.org
www.gov.uk
hbomax.com
javmix.tv
huaban.com
redgifs.com
xuexi.cn
xunlei.com
18183.com
cloudconvert.com
citi.com
apkpure.com
animixplay.to
crunchyroll.com
rutracker.org
premierleague.com
rottentomatoes.com
rumble.com
nunuyy3.org
canada.ca
investopedia.com
manage.wix.com
oschina.net
itch.io
xueqiu.com
v2ex.com
merriam-webster.com
4399.com
kooora.com
flashscore.com
ptt.cc
woodbeesdainty.com
rambler.ru
mercadolibre.com.mx
rule34.xxx
interia.pl
189.cn
cuevana3.me
lenovo.com
1fichier.com
trustpilot.com
blizzard.com
rapidgator.net
motherless.com
thepiratebay.org
ebay.co.uk
curseforge.com
ixxx.com
gsmarena.com
dribbble.com
atlassian.net
adp.com
nowcoder.com
squarespace.com
oraclecloud.com
getbootstrap.com
yhdmp.cc
myzaker.com
vnexpress.net
britannica.com
gamespot.com
neexulro.net
sberbank.ru
evernote.com
sznews.com
dy2018.com
taboola.com
o8tv.com
goo.ne.jp
outbrain.com
hostinger.com
asura.gg
pku.edu.cn
mercari.com
boyfriendtv.com
peeredgerman.com
okezone.com
zxxk.com
rezka.ag
7mmtv.sx
formula1.com
zoro.to
ixigua.com
google.es
agoda.com
srvtrck.com
9game.cn
mgtv.com
togetter.com
sinaimg.cn
weebly.com
hm.com
forms.gle
webofscience.com
tenki.jp
irctc.co.in
atwiki.jp
hqporner.com
livejournal.com
hotmart.com
lanzout.com
kissjav.li
123pan.com
vecteezy.com
pornzog.com
crengate.com
duolingo.com
udn.com
wattpad.com
openai.com
xbox.com
ibm.com
chinatax.gov.cn
turkiye.gov.tr
upornia.com
pcbeta.com
storage.googleapis.com
spiegel.de
discordapp.com
cnet.com
weiyun.com
uptobox.com
ettoday.net
jut.su
lowes.com
google.com.ar
asos.com
wikimedia.org
kahoot.it
aol.com
billdesk.com
bloomberg.com
icloud.com
fuliba2022.net
ctfile.com
redfin.com
blogimg.jp
kdocs.cn
domestich.xyz
omofun.tv
nintendo.com
bongacams.com
google.com.vn
elsevier.com
livedoor.com
126.com
4channel.org
semrush.com
lazada.co.th
pixnet.net
brave.com
b2clogin.com
mayoclinic.org
realtor.com
xitongzhijia.net
amazon.eg
sjtu.edu.cn
eroterest.net
npmjs.com
myfreecams.com
biancheng.net
mlb.com
farsnews.ir
wordreference.com
wps.cn
ezgif.com
1x001.com
blackboard.com
autodesk.com
wsj.com
maigoo.com
5ch.net
soap2day.to
allegro.pl
wanfangdata.com.cn
afreecatv.com
pornone.com
dreamstime.com
rakuten.com
steamdb.info
corriere.it
wayfair.com
alibaba-inc.com
python.org
mangafreak.net
uchi.ru
fitgirl-repacks.site
ytimg.com
mokahr.com
kakaku.com
fapello.com
idnes.cz
rbc.ru
x-mol.com
17173.com
neea.edu.cn
miro.com
nypost.com
glassdoor.com
amazon.com.au
wykop.pl
guidechem.com
bytedance.net
hdtoday.tv
lanzouw.com
2ch-c.net
patria.org.ve
huijiwiki.com
mdpi.com
wp.com
manatoki157.net
redbubble.com
web-hosting.com
xfantazy.com
lectortmo.com
dhl.com
doordash.com
javdb005.com
fmovies.to
lgyy.cc
eastday.com
mercadolivre.com.br
9anime.vc
avgle.com
xiaomi.com
pikabu.ru
ximalaya.com
jinritemai.com
feimaoyun.com
monday.com
nexon.com
gumroad.com
adobelogin.com
raw.githubusercontent.com
google.az
businessinsider.com
justdial.com
madrasati.sa
ubereats.com
liepin.com
cityheaven.net
discover.com
yjbys.com
wiktionary.org
zxx.edu.cn
studentaid.gov
google.it
cisco.com
repubblica.it
chingari.io
sina.cn
po-kaki-to.com
kuwo.cn
pornpics.com
bluehost.com
zcool.com.cn
novinky.cz
php.cn
17track.net
tianya.cn
right.com.cn
zerodha.com
slickdeals.net
58pic.com
detik.com
elpais.com
powerbi.com
hh.ru
notion.site
yandex.com.tr
livescore.com
dmm.com
files.wordpress.com
y2mate.is
docker.com
substack.com
oup.com
flaticon.com
lx.pub
game8.jp
verizon.com
manhuagui.com
ultimate-guitar.com
pngtree.com
jjwxc.net
expedia.com
digitalocean.com
intel.com
naukri.com
xvideos-cdn.com
webtoons.com
go.com
wallhaven.cc
ticketmaster.com
streamtape.com
webmd.com
makeuseof.com
tamin.ir
wondershare.com
36kr.com
pchome.com.tw
bitbucket.org
jmcomic2.moe
mypoweroffer.com
hnr.cn
sarkariresult.com
xvideos.red
aa.com
airtable.com
5movierulz.mn
yiyouliao.com
caliente.mx
nvidia.cn
letpub.com.cn
olx.com.br
xiaoheimi.net
bilibili.tv
yanetflix.com
mercadolibre.com.ve
business.site
tandfonline.com
drom.ru
usatoday.com
td.com
cima-club.icu
bp.blogspot.com
shopee.ph
criteo.com
likecs.com
blizzardgames.cn
rmdown.com
voe.sx
downza.cn
freelancer.com
optnx.com
etherscan.io
justwatch.com
amd.com
tap.az
ibb.co
collegeboard.org
sagepub.com
ustc.edu.cn
liquipedia.net
dbs.com.sg
moneycontrol.com
423down.com
eventbrite.com
49n7wqynho5u.top
imagefap.com
disqus.com
google.co.id
tsinghua.edu.cn
kuaishou.com
ancestry.com
amazon.ae
18comic.vip
zalo.me
ikco.ir
manganato.com
sex.com
urtseysadm.one
donmai.us
iporntv.net
ebay-kleinanzeigen.de
elmundo.es
yandex.kz
fantia.jp
ebay.de
11st.co.kr
furaffinity.net
yangkeduo.com
zxzj.vip
subhd.tv
harvard.edu
biblegateway.com
jd.hk
faphouse.com
fanbox.cc
rutube.ru
errors.net
pornez.net
vjav.com
peacocktv.com
windowsazure.com
amap.com
ivi.ru
lianjia.com
adblockplus.org
onelink.me
thesaurus.com
goo.gl
xjtu.edu.cn
studocu.com
qoo10.sg
themoviedb.org
webmota.com
ajio.com
irs.gov
myflixer.to
royalbank.com
minecraft.net
bscscan.com
payoneer.com
zhiye.com
ssc.nic.in
3d66.com
shobserver.com
desmos.com
jetbrains.com
teambition.com
t-online.de
timeanddate.com
irene-eux.com
auth0.com
goojara.to
zju.edu.cn
google.com.pe
mangadex.org
sehuatang.org
bg4nxu2u5t.com
bestjavporn.com
bankmellat.ir
pinduoduo.com
ansa.it
lordfilm.lu
fourpetal.com
aliyundrive.com
dianxiaomi.com
marketwatch.com
surveymonkey.com
kakuyomu.jp
edrubyglo.buzz
thaudray.com
bookmyshow.com
android.com
bakusai.com
dramacool.cr
liveuamap.com
list-manage.com
sky.com
tinder.com
codecanyon.net
b-ok.cc
byjus.com
bild.de
kafan.cn
myvidster.com
lazada.com.my
ubisoft.com
masahub.net
activehosted.com
jaavnacsdw.com
cint.com
egybest.bid
uniqlo.com
uidai.gov.in
socialmediagirls.com
skroutz.gr
ok.xxx
hatenablog.com
vmware.com
daraz.pk
superuser.com
mycimaa.icu
sxyprn.net
japanpost.jp
cdc.gov
google.com.pk
tabelog.com
iplaysoft.com
dhl.de
cqvip.com
gd.gov.cn
yimg.com
segmentfault.com
thesun.co.uk
yinghuacd.com
meituan.com
gazeta.pl
66law.cn
pcauto.com.cn
github.io`.split("\n"));

export { websiteWhitelist };
