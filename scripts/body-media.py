"""Vendor only the attributed images used inside Body, not a redistributable dataset."""
import concurrent.futures, html, json, pathlib, re, urllib.parse, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/body/media'
BASE = 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/'
def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'BodyAtlas/1.0 (personal exercise reference)'})
    return urllib.request.urlopen(req, timeout=40).read()
# Explicit visual matches; no fuzzy title matching and no substituted weighted exercises.
MATCH = {
 'pull-up:scapular':'scapular-pull-ups', 'pull-up:assisted':'band-assisted-pull-ups',
 'pull-up:negative':'negative-pull-ups','pull-up:pullup':'pull-up','pull-up:archer':'archer-pull-ups',
 'rows:incline':'ring-row',
 'front-lever:full':'front-lever','back-lever:full':'back-lever',
 'muscle-up:ring':'ring-muscle-up',
 'push-up:wall':'wall-push-ups','push-up:incline':'incline-push-ups','push-up:full':'push-up',
 'push-up:diamond':'diamond-push-ups','push-up:rings':'ring-push-up',
 'dips:dip':'dips','dips:ring':'ring-dips',
 'handstand-push-up:pike':'pike-push-ups','handstand-push-up:free':'handstand-push-ups',
 'planche:full':'planche','planche-push-up:pseudo':'pseudo-planche-push-ups',
 'elbow-lever:frog':'crow-pose',
 'leg-raise:knees':'hanging-knee-raise','leg-raise:toes':'hanging-pike',
 'rollout:plank':'plank','rollout:kneeling':'ab-wheel-rollout','dragon-flag:full':'dragon-flag',
 'pistol:assisted-squat':'trx-squat','pistol:squat':'bodyweight-squat',
 'pistol:assisted':'trx-pistol-squat','pistol:full':'pistol-squat',
 'nordic:bridge':'glute-bridge','nordic:full':'nordic-hamstring-curl',
 'bridge:shoulder':'glute-bridge','bridge:full':'thoracic-bridge','human-flag:full':'human-flag',
 'l-sit:full':'commons-lsit','iron-cross:full':'commons-cross','handstand:free':'handstand-hold',
 'elbow-lever:full':'commons-elbow'
}
# These are explicitly labelled related references, never exact demonstrations.
REFERENCE = {
 'pull-up':'pull-up','rows':'inverted-row','front-lever':'front-lever','back-lever':'back-lever',
 'muscle-up':'ring-muscle-up','push-up':'push-up','dips':'dips','handstand':'handstand-hold',
 'handstand-push-up':'handstand-push-ups','planche':'planche','planche-push-up':'pseudo-planche-push-ups',
 'elbow-lever':'commons-elbow','l-sit':'commons-lsit','leg-raise':'hanging-pike','rollout':'ab-wheel-rollout',
 'dragon-flag':'dragon-flag','pistol':'pistol-squat','shrimp':'step-ups','nordic':'nordic-hamstring-curl',
 'bridge':'thoracic-bridge','human-flag':'human-flag','iron-cross':'commons-cross'
}
RELATED={'pistol:split':'split-squat','pistol:bulgarian':'bulgarian-split-squat','shrimp:step':'step-ups','shrimp:deep':'step-ups','rows:row':'inverted-row','leg-raise:straight':'hanging-pike'}
COMMONS={
 'commons-lsit':('Figura L-Sit na paraletkach.jpg','L-sit on parallettes'),
 'commons-cross':('Example2ofironcross.jpg','Iron cross'),
 'commons-elbow':('Peacock pose.jpg','Elbow lever / peacock pose')
}
def main():
    OUT.mkdir(exist_ok=True)
    data={e['id']:e for e in json.loads(fetch(BASE+'exercises.json'))['exercises']}
    assets={}
    ids=sorted((set(MATCH.values())|set(REFERENCE.values())|set(RELATED.values()))-set(COMMONS)-{'handstand-hold'})
    def rep(k):
        e=data[k];frames=[]
        for label,src in e['images']['flat'].items():
            name=pathlib.Path(src).name; dest=OUT/name
            if not dest.exists():dest.write_bytes(fetch(BASE+src))
            frames.append({'src':'./media/'+name,'label':'Pose '+str(len(frames)+1)})
        return k,{'name':e['name_en'],'frames':frames,'provider':'RepDB','author':'RepDB / Sergei Argutin','source':'https://exercise-dataset.com/exercise/'+k+'/','license':'RepDB Free Tier','licenseUrl':'https://github.com/RepDB/exercise-dataset/blob/main/LICENSE-DATA.md','kind':'illustration'}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        assets.update(pool.map(rep,ids))
    q={'action':'query','format':'json','prop':'imageinfo','iiprop':'url|extmetadata','titles':'|'.join('File:'+v[0] for v in COMMONS.values())}
    pages=json.loads(fetch('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(q)))['query']['pages'].values()
    bytitle={p['title']:p['imageinfo'][0] for p in pages}
    for k,(title,name) in COMMONS.items():
        info=bytitle['File:'+title];meta=info['extmetadata'];author=html.unescape(re.sub('<[^>]+>','',meta['Artist']['value']))
        dest=OUT/(k+'.jpg')
        if not dest.exists():dest.write_bytes(fetch(info['url'].split('?')[0]))
        assets[k]={'name':name,'frames':[{'src':'./media/'+dest.name,'label':'Reference photo'}],'provider':'Wikimedia Commons','author':author,'source':info['descriptionurl'],'license':meta['LicenseShortName']['value'],'licenseUrl':meta.get('LicenseUrl',{}).get('value',info['descriptionurl']),'kind':'photo'}
    (OUT/'LICENSE-REPDB.txt').write_bytes(fetch(BASE+'LICENSE-DATA.md'))
    assets['handstand-hold']={**assets['handstand-push-ups'],'name':'Handstand on parallettes','frames':[f for f in assets['handstand-push-ups']['frames'] if '-start.' in f['src']]}
    for k,label in {'split-squat':'Weighted split squat','bulgarian-split-squat':'Weighted rear-foot-elevated split squat','step-ups':'Weighted step-up','inverted-row':'Incline bodyweight row','hanging-pike':'Toes to bar'}.items():
        assets[k]['name']=label
    out={'assets':assets,'matches':MATCH,'references':REFERENCE,'related':RELATED}
    (ROOT/'public/body/media.js').write_text('/* Visual references used inside Body. See each asset for attribution. */\n(function(root){const media='+json.dumps(out,ensure_ascii=False,indent=2)+';root.BODY_MEDIA=media;if(typeof module!=="undefined")module.exports=media;})(typeof window!=="undefined"?window:globalThis);\n')
    (OUT/'CREDITS.md').write_text('# Exercise imagery\n\nExercise data by [RepDB (repdb.co)](https://repdb.co). Only the subset used inside this application is included; the source license applies to these assets. Images are original AI-generated illustrations supplied by RepDB, not photographs.\n\nWikimedia photographs are unmodified and individually attributed below.\n\n'+'\n'.join(f"- **{a['name']}** — {a['author']}. [{a['license']}]({a['licenseUrl']}). [Original]({a['source']})." for a in assets.values() if a['provider']=='Wikimedia Commons'))
    print('Assets:',len(assets),'exact mappings:',len(MATCH),'files:',len(list(OUT.glob('*.webp')))+len(COMMONS))
if __name__=='__main__':main()
