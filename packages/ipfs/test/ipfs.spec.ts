import { ICidInfo, hashDir, hashItems, hashContent, hashFile} from '../src/index';
import assert from 'assert';
import Path from 'path';

// import fs from 'fs';
// import Hash from './hashOnly';

// describe('IPFS (Non zero dependency)', function () {
//   it('hash text file v0 size 1048577', async () => {
//     let stream = fs.createReadStream('./1048577.bin');
//     let c = await Hash.of(stream, {cidVersion: 0});
//     assert.strictEqual(c, 'Qmeb988ZjF9Ui6AVPR8Sjg5sAv1B6DauS5rUjCoNs7ftZ1');    
//   });
//   it('hash text file v1 size 1048577', async () => {    
//     let stream = fs.createReadStream(Path.resolve(__dirname, './1048577.bin'));
//     let c = await Hash.of(stream, {cidVersion: 1, rawLeaves: true, maxChunkSize: 1048576}); //match with web3.storage
//     assert.strictEqual(c, 'bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq');    
//   });  
  // it('hash directory', async ()=>{
  //   let result = await Hash.ofDir(Path.resolve(__dirname, 'dir'))
  //   console.dir(result);
  // })
// });

describe('IPFS', function () {
  it('hash items', async function () {
    //https://dweb.link/api/v0/ls?arg=bafybeibaezzbawsecdzc5rbrphgvu46d5l6yv475sfwofbs7vfnqqewooa
    let data: ICidInfo = {
      "cid": "bafybeibaezzbawsecdzc5rbrphgvu46d5l6yv475sfwofbs7vfnqqewooa",
      "name": "",
      "size": 13968396,
      "type": "dir",
      "links": [
          {
              "cid": "bafkreidr2kp376qi4ouo5w7vk7kfnyhync3sflo5lrgu6ndam6vqyqekqq",
              "name": "Banner-Guide.jpg",
              "size": 264554,
              "type": "file"
          },
          {
              "cid": "bafkreicrrpqqkr3ryqwefedowaxl2yzx63ftgxkjrnpm5xhb7lcpojfofy",
              "name": "Banner-Rule (1).jpg",
              "size": 129424,
              "type": "file"
          },
          {
              "cid": "bafkreidd3tsvfapilde3wj7unc4vi7x6yywwsuosvg6zgpk65n4kz75eue",
              "name": "Banner-Rule.jpg",
              "size": 173462,
              "type": "file"
          },
          {
              "cid": "bafkreib4c74nyuibalbbddam44yar7s45cocsidhonjllqk7wozkkzyvxe",
              "name": "Banner-bright-example (1).jpg",
              "size": 49130,
              "type": "file"
          },
          {
              "cid": "bafkreieqdtj4pald7h7bqgyspiuoi2uc5qkhh2brdhexdci5w7etgf6b4i",
              "name": "Banner-bright-example.jpg",
              "size": 49344,
              "type": "file"
          },
          {
              "cid": "bafkreiccnuuzuejqhmr4i2o7tqentwu7u55ncq2cw4hdxlhhe227bxgs6e",
              "name": "Banner-dark-example (1).jpg",
              "size": 85749,
              "type": "file"
          },
          {
              "cid": "bafkreie7vpcwyt23365c3zfgnapcztrhrwvsow7v7kmar5dkc7iayzig7a",
              "name": "Banner-dark-example.jpg",
              "size": 85892,
              "type": "file"
          },
          {
              "cid": "bafkreieqs4rtlifse7imrh6aqpdfhukbmyzi3dlmf2xujsaqvnzsfov7cy",
              "name": "Banner_template (1).ai",
              "size": 308155,
              "type": "file"
          },
          {
              "cid": "bafkreifkbfgjpnenxgkpragdfbg7obplffeloho6hurmzvelu7pjqs75b4",
              "name": "Banner_template.ai",
              "size": 316526,
              "type": "file"
          },
          {
              "cid": "bafkreidurjqolwu6civgoi4lqfihcnnk5xx2gujimti3pe26ugx7nwbpki",
              "name": "BoosterQueue2.jpg",
              "size": 301644,
              "type": "file"
          },
          {
              "cid": "bafkreiav6t62k4sofgcisacoitwaqwxybntdkesvfu525u4iutv3idgbu4",
              "name": "Ecosystem Milestones 20211018 (1).jpg",
              "size": 843890,
              "type": "file"
          },
          {
              "cid": "bafkreidtkzkjbzg6ripjkhtbpjvm534ulertcurx7lfsyh2meefa4qczzq",
              "name": "Ecosystem Milestones 20211018 1125am.jpg",
              "size": 851609,
              "type": "file"
          },
          {
              "cid": "bafkreiav6t62k4sofgcisacoitwaqwxybntdkesvfu525u4iutv3idgbu4",
              "name": "Ecosystem Milestones 20211018.jpg",
              "size": 843890,
              "type": "file"
          },
          {
              "cid": "bafkreige732ect4v2v236sowtikic2za7qxhlizjxkfddab73mlcsmau6u",
              "name": "FarmingStaking.jpg",
              "size": 127490,
              "type": "file"
          },
          {
              "cid": "bafkreifm4q7qnbns2hps24ss5xfitzn3ft7hkyqslb7l2suspyulsyvjjq",
              "name": "HybridSmartRouter.jpg",
              "size": 204018,
              "type": "file"
          },
          {
              "cid": "bafkreiemudrphynn4mzj7a3r7eqhlms6nfjv7dqkwdmrgaqkyue5klin3u",
              "name": "IJS Logo.png",
              "size": 4380,
              "type": "file"
          },
          {
              "cid": "bafkreigxtumlbvsfmxw3d2wer3w3fa5fwzqt6qv4ve2p4aq3br7vo7eyfy",
              "name": "IntegratingHybridSmartRouter (1).jpg",
              "size": 209620,
              "type": "file"
          },
          {
              "cid": "bafkreigxtumlbvsfmxw3d2wer3w3fa5fwzqt6qv4ve2p4aq3br7vo7eyfy",
              "name": "IntegratingHybridSmartRouter.jpg",
              "size": 209620,
              "type": "file"
          },
          {
              "cid": "bafkreifvjclesssu7aceufj6eiwztzewl6nz55exijtlacxguocahg3zvy",
              "name": "Lessliquidity.jpg",
              "size": 102585,
              "type": "file"
          },
          {
              "cid": "bafkreifxun7agkenrxisl3z52dep4m56sa46x4nmpxvvo37rw64mezj2ma",
              "name": "Liquidity_queue.jpg",
              "size": 177696,
              "type": "file"
          },
          {
              "cid": "bafkreibkyka3ae5w3i6fxgtgdttm6ttfuxyvx7m5xvxrzsi4cfbqsydyzy",
              "name": "NFT-Loyal.jpg",
              "size": 130011,
              "type": "file"
          },
          {
              "cid": "bafkreiaslka3utcxjswxm267guqwxcqawhsq6vcmfozsjwcy77rurxgwki",
              "name": "OP-Image1.png",
              "size": 279782,
              "type": "file"
          },
          {
              "cid": "bafkreibnexq2o4nqqhmsarwajt22skpev7pq2gqcnjzdkkdmmahbcyf32q",
              "name": "OP-Image2.png",
              "size": 8135,
              "type": "file"
          },
          {
              "cid": "bafkreieusfs74nbvry6kqof4734uoacqwlh6bkmbizvudqv4fdeqbbvldq",
              "name": "OSPro_Roadmap.jpg",
              "size": 124206,
              "type": "file"
          },
          {
              "cid": "bafkreicboh5wg4ayc3mytviwo26aun3j56pcvn4k7rlp2xlaxltlqr6jbi",
              "name": "OpenInterchain.jpg",
              "size": 260987,
              "type": "file"
          },
          {
              "cid": "bafkreicrjha4gtjrnoasdl6cc4muckaou65unf32nygp2ra3t7znjjftx4",
              "name": "OpenInterchainConcept.jpg",
              "size": 432612,
              "type": "file"
          },
          {
              "cid": "bafkreieekjioxfzw34q5ohea4qzfddexwuioxfmpsphzdn2hfqvcrpeyhi",
              "name": "OpenInterchainFlow.jpg",
              "size": 119742,
              "type": "file"
          },
          {
              "cid": "bafkreicgr6yxx5fvxuueszzzlwbouxovef6s6vhzo5ob2hwrvqbhfyqhhu",
              "name": "OpenInterchainWork.jpg",
              "size": 169431,
              "type": "file"
          },
          {
              "cid": "bafkreigpomcriygzu74w3hjz52pdqc2kijqrhxnml6xp2c4yw2fhwhynse",
              "name": "RestrictedGroupQueue.jpg",
              "size": 186393,
              "type": "file"
          },
          {
              "cid": "bafkreifcchnppnaqvqnt7vdrwmavwaxfhi2hj7wjohnqjm4iddkrgowlcq",
              "name": "RoadMap_GitBook_20210723_Black_Text (1).png",
              "size": 169506,
              "type": "file"
          },
          {
              "cid": "bafkreidahaswgkyzgix4nhr3ukintchy36qo3ivjv5kt3gyyay6zxfxuse",
              "name": "RoadMap_GitBook_20210723_Black_Text.png",
              "size": 169012,
              "type": "file"
          },
          {
              "cid": "bafkreiacglxcugmif5qcthzdahd4jctcv42loxammq53n46yqsavqh66py",
              "name": "Roadmap for Gitbook.png",
              "size": 125412,
              "type": "file"
          },
          {
              "cid": "bafkreiegla4cxa3lwbyvi5gsizvmcc2ryeaogibi2u7ssd5jqxk25oldky",
              "name": "Roadmap.jpg",
              "size": 240909,
              "type": "file"
          },
          {
              "cid": "bafkreidw7wm2qluvcwoqiyc5hhbdnxexxbkucntkcaliruwgv46lvp2g6u",
              "name": "Roadmap_20210802_255pm.png",
              "size": 170969,
              "type": "file"
          },
          {
              "cid": "bafkreiejzcdug3uhk4v7nf42lkil5coe572fng57pqroqu6mccmqz2mu6u",
              "name": "Roadmap_Pink.png",
              "size": 89965,
              "type": "file"
          },
          {
              "cid": "bafkreihnd6twdlszg7esenlyadq27hudn7b3spt2oc7jmccvl6xpbzwt6e",
              "name": "Roadmap_Yellow (1).png",
              "size": 89358,
              "type": "file"
          },
          {
              "cid": "bafkreihnd6twdlszg7esenlyadq27hudn7b3spt2oc7jmccvl6xpbzwt6e",
              "name": "Roadmap_Yellow.png",
              "size": 89358,
              "type": "file"
          },
          {
              "cid": "bafkreia5oveemhlgjeejxcprziqsoucdyjht7tkxv5sg6ufgcs2t4kqqhi",
              "name": "Tokenomic.jpg",
              "size": 127516,
              "type": "file"
          },
          {
              "cid": "bafkreihace4tk2u7yf44kr34xn77l7iqtprakx22x53jyuotgxh3tfpf2a",
              "name": "greenTroll.jpg",
              "size": 88104,
              "type": "file"
          },
          {
              "cid": "bafkreifhvdrchycri3qpriyoeoyb44mbwgfanwwwo7t4odtqtzciv26o44",
              "name": "image (1).png",
              "size": 58243,
              "type": "file"
          },
          {
              "cid": "bafkreifiq5hdijekcusbrkddeta4yz6evce4rd3nahqgl63lckuhza7nki",
              "name": "image (10).png",
              "size": 37391,
              "type": "file"
          },
          {
              "cid": "bafkreiepxeusq5xs5hmxmpvpacegibzwotmxfrznwqevrqbhubidcmptna",
              "name": "image (11).png",
              "size": 26767,
              "type": "file"
          },
          {
              "cid": "bafkreid35rxcwoiezxiklrbqtyl42cee4bq75ybkv65genk7ctarloeldu",
              "name": "image (12).png",
              "size": 67332,
              "type": "file"
          },
          {
              "cid": "bafkreif7phlkxw7m72x3xokvqcvunj2toxdmetoayptvkjgvm7575f2e5u",
              "name": "image (13).png",
              "size": 66967,
              "type": "file"
          },
          {
              "cid": "bafkreif7phlkxw7m72x3xokvqcvunj2toxdmetoayptvkjgvm7575f2e5u",
              "name": "image (14).png",
              "size": 66967,
              "type": "file"
          },
          {
              "cid": "bafkreiamx5ud5mist76duxbup5lduwzojdsnvi44dxox3fr56afkcyndiu",
              "name": "image (15).png",
              "size": 91337,
              "type": "file"
          },
          {
              "cid": "bafkreieenod437o2yuwxrwzvlzuumtxpiux7x5u4jgam3mje62q2hts4di",
              "name": "image (16).png",
              "size": 20120,
              "type": "file"
          },
          {
              "cid": "bafkreiae4owz42tc7nm7caq2zdo2qjssxwki6bagy3jzccvabgky5yuvte",
              "name": "image (17).png",
              "size": 43336,
              "type": "file"
          },
          {
              "cid": "bafkreiatpszhlc2grxoldaac4y5n5f2jo7xtu3dnapamwljun25xhiguja",
              "name": "image (18).png",
              "size": 7633,
              "type": "file"
          },
          {
              "cid": "bafkreibaaxrh56nqrmjxxlsav3wzvfiuhj2kfq7z3iqzxzpgpqpg4p7dga",
              "name": "image (19).png",
              "size": 13963,
              "type": "file"
          },
          {
              "cid": "bafkreibzx52vfnxfxnbc2aaynqnsu54yxioxdbiwnyuqqmcsb7voxqu5si",
              "name": "image (2).png",
              "size": 7628,
              "type": "file"
          },
          {
              "cid": "bafkreigxnon4v5ipzqgppgnt6kq4p46sdu6fafj4o5hg5c7fyo4jeqjfou",
              "name": "image (20).png",
              "size": 8628,
              "type": "file"
          },
          {
              "cid": "bafkreidacgrv46wxvbqwnq3tvjg3ag2f6cx4utofdyebeiijizalyxl4w4",
              "name": "image (21).png",
              "size": 16096,
              "type": "file"
          },
          {
              "cid": "bafkreigoscjpnkb5zlw6mphatgrtjdmrqnjwrufyvpkfl5qtj3tbo2vqqy",
              "name": "image (22).png",
              "size": 16903,
              "type": "file"
          },
          {
              "cid": "bafkreihtjpz6ihn2rzghoweolgofg3ufpznkos4pdox36vh3qbq6axl2di",
              "name": "image (23).png",
              "size": 12957,
              "type": "file"
          },
          {
              "cid": "bafkreicdiwov7cyktilzo2wihj3rr2ayfuqlzbc3bnr6ygjrq4icethocq",
              "name": "image (24).png",
              "size": 5176,
              "type": "file"
          },
          {
              "cid": "bafkreiffjsuumxychsslmxs2tfnbwvwvglbzdmis3ajr4sznfvky5u2z7q",
              "name": "image (25).png",
              "size": 4567,
              "type": "file"
          },
          {
              "cid": "bafkreigjdhscz2odz6k5hr4dcghax4f5ulqqiqbt73h7hfkvuoepofcvmm",
              "name": "image (26).png",
              "size": 71206,
              "type": "file"
          },
          {
              "cid": "bafkreigcfduviqvwyukw46kzew7c5imqiygy735bft6j5foqnsya33xxqe",
              "name": "image (27).png",
              "size": 13250,
              "type": "file"
          },
          {
              "cid": "bafkreid2tgumt6zf5tfbu5nulprumzs7jbaipvsvfuhttudjilxre46e3y",
              "name": "image (28).png",
              "size": 10672,
              "type": "file"
          },
          {
              "cid": "bafkreiadl3dy6b7psvarimhs6trw2y5c7v2q5vjb6mfsga2dahf7vh3a5m",
              "name": "image (29).png",
              "size": 6124,
              "type": "file"
          },
          {
              "cid": "bafkreiawp2e64fh2jbjnk7zc4uwgxecdexexq26dte7hd7kdccwoq43ycu",
              "name": "image (3).png",
              "size": 7740,
              "type": "file"
          },
          {
              "cid": "bafkreibiduxttu7wk6vx6a7lbvr3kujml5e27nj3yg63ptqikom3ynp4dy",
              "name": "image (30).png",
              "size": 46850,
              "type": "file"
          },
          {
              "cid": "bafkreiavm2tjkuxe2zkvaipmc2nl67szy2w5v4qy2jzegqecr5pvytp72m",
              "name": "image (31).png",
              "size": 62120,
              "type": "file"
          },
          {
              "cid": "bafkreifgcwd3bvj4yfnjs5hnwryayyqucz54llwtlxfswohukwhk4qzugm",
              "name": "image (32).png",
              "size": 111776,
              "type": "file"
          },
          {
              "cid": "bafkreigb42gksq4l2xdpq3vpwgz3awaxah7z6c4hrzs226dc7oecnsyhpy",
              "name": "image (33).png",
              "size": 112205,
              "type": "file"
          },
          {
              "cid": "bafkreiepyc4o63i3nt3zcrxafw6im55652rb2tygdabhgekzxyvyqlhara",
              "name": "image (34).png",
              "size": 65904,
              "type": "file"
          },
          {
              "cid": "bafkreiepyc4o63i3nt3zcrxafw6im55652rb2tygdabhgekzxyvyqlhara",
              "name": "image (35).png",
              "size": 65904,
              "type": "file"
          },
          {
              "cid": "bafkreidb2wdo7dwxlfv3xqpprvjiqlw7h3so7j7xypax2h7qleo24ixml4",
              "name": "image (36).png",
              "size": 129096,
              "type": "file"
          },
          {
              "cid": "bafkreib7sd5hurafktpeskjzbgf67nckmnps5zeygdzv4zvaiouizng32y",
              "name": "image (37).png",
              "size": 118275,
              "type": "file"
          },
          {
              "cid": "bafkreiabqquhf6rg4eu4t6glgrkfyzbqqw22azkjvzsxewsfdxkasemace",
              "name": "image (38).png",
              "size": 145231,
              "type": "file"
          },
          {
              "cid": "bafkreihardery4w5diripmy7qg34aqjrwso4tlxcb3swe4wjwbfpeezrqy",
              "name": "image (39).png",
              "size": 162450,
              "type": "file"
          },
          {
              "cid": "bafkreiewtwjwth2gmvxlynlwmoi5rngq5sjw2rdqznc3voccczq32y5jr4",
              "name": "image (4).png",
              "size": 43428,
              "type": "file"
          },
          {
              "cid": "bafybeidozewhivatocukvcn2tlqch5qknyk7c5wp7ktk3zcjty5xzqycum",
              "name": "image (40).png",
              "size": 1244759,
              "type": "file"
          },
          {
              "cid": "bafkreigenb2dhsluxey3yxovzoi4czfemtycmyg2dzd5oa66ynzctjeehy",
              "name": "image (41) (1).png",
              "size": 99328,
              "type": "file"
          },
          {
              "cid": "bafkreigenb2dhsluxey3yxovzoi4czfemtycmyg2dzd5oa66ynzctjeehy",
              "name": "image (41) (2).png",
              "size": 99328,
              "type": "file"
          },
          {
              "cid": "bafkreigenb2dhsluxey3yxovzoi4czfemtycmyg2dzd5oa66ynzctjeehy",
              "name": "image (41).png",
              "size": 99328,
              "type": "file"
          },
          {
              "cid": "bafkreigenb2dhsluxey3yxovzoi4czfemtycmyg2dzd5oa66ynzctjeehy",
              "name": "image (42).png",
              "size": 99328,
              "type": "file"
          },
          {
              "cid": "bafkreigenb2dhsluxey3yxovzoi4czfemtycmyg2dzd5oa66ynzctjeehy",
              "name": "image (43).png",
              "size": 99328,
              "type": "file"
          },
          {
              "cid": "bafkreigenb2dhsluxey3yxovzoi4czfemtycmyg2dzd5oa66ynzctjeehy",
              "name": "image (44).png",
              "size": 99328,
              "type": "file"
          },
          {
              "cid": "bafkreicx6ik76uayrq24yci3l5trkkpxsusuxkntlece4ij2wwevdmgptq",
              "name": "image (45).png",
              "size": 126964,
              "type": "file"
          },
          {
              "cid": "bafkreigaph2fxcgvrtzkioslkqh2wwko4xzwdpz2xo4mxmih2okw7l477e",
              "name": "image (46).png",
              "size": 20853,
              "type": "file"
          },
          {
              "cid": "bafkreibxrbehk4q6al6oe2kpn6wcvv7efre22fftweuifufgxoyguvi3ym",
              "name": "image (47).png",
              "size": 71769,
              "type": "file"
          },
          {
              "cid": "bafkreiavhnhpag23uviz7xqlirzn7djzsgewxhykcjs4asouqsyfxcurby",
              "name": "image (48).png",
              "size": 20256,
              "type": "file"
          },
          {
              "cid": "bafkreihre4ku4a3yxo4qwyaqe7aa4hdbywsjki4khjdrfulhza3ddlvicy",
              "name": "image (49).png",
              "size": 72921,
              "type": "file"
          },
          {
              "cid": "bafkreif3nzdusav5wkioof2x74e2dzxnbl4pzrsewbnikurnn7earewb4i",
              "name": "image (5).png",
              "size": 60700,
              "type": "file"
          },
          {
              "cid": "bafkreigqeco6tgfhvdwbenpqlb5fue7k6rg23ac63qpwxwrani45233fhi",
              "name": "image (50).png",
              "size": 22864,
              "type": "file"
          },
          {
              "cid": "bafkreiccpelehh22ix67wlg5ajg4knzuyqtrwlk6aq7jy7dmkgj75kk2xa",
              "name": "image (51).png",
              "size": 68426,
              "type": "file"
          },
          {
              "cid": "bafkreiclcro7svaunjjtas5zn77fyyo6isyrr4nnro6i22jtoi6zmi4viq",
              "name": "image (52).png",
              "size": 68403,
              "type": "file"
          },
          {
              "cid": "bafkreidn2qspioyxsrbqf4aa4ybgy4kqr3tzrhimmam7jdbzmkvsoe64wq",
              "name": "image (53).png",
              "size": 136733,
              "type": "file"
          },
          {
              "cid": "bafkreig7c5y7evv4uhx5nrcx3umd6ihhz27uzzgthsuvudcgoeie3udxqm",
              "name": "image (54).png",
              "size": 137144,
              "type": "file"
          },
          {
              "cid": "bafkreigoweem3fkvggknxwiuhwwh7xr5olzan2ct3uk4mo24lppi7v7raa",
              "name": "image (55).png",
              "size": 37208,
              "type": "file"
          },
          {
              "cid": "bafkreigy7mauwwz5tplrj35edgeraxr62qafkrafpqtqg2z5yncfb5wgua",
              "name": "image (56).png",
              "size": 61582,
              "type": "file"
          },
          {
              "cid": "bafkreibbn4jqn6bhbsmwx35fyjbk6lkbu774qyfp42immtrvhvigjn2ige",
              "name": "image (57).png",
              "size": 149804,
              "type": "file"
          },
          {
              "cid": "bafkreiaoz4cp3naaci37boomchgtmmvdcggztk5vsqylm5plamwnax7vyq",
              "name": "image (58).png",
              "size": 70356,
              "type": "file"
          },
          {
              "cid": "bafkreiemqmfwshfjphras6hhqtvyadsgrgkdjpgf7mto3io5akimuerdvi",
              "name": "image (59).png",
              "size": 121874,
              "type": "file"
          },
          {
              "cid": "bafkreidmcaypnosfu3cdcgonaqr24zus2l7myxgdpf6uw7c3nfchloaqci",
              "name": "image (6).png",
              "size": 35181,
              "type": "file"
          },
          {
              "cid": "bafkreihqjxgxv4eymck6hpa6swpl3jmmbh6aywj6olw4g7btnlypl2o5xe",
              "name": "image (60).png",
              "size": 137794,
              "type": "file"
          },
          {
              "cid": "bafkreigxun54y64x35oe27dd7tmakqnc5q6unzol74zpv7fkdxd7omgb2m",
              "name": "image (61).png",
              "size": 198513,
              "type": "file"
          },
          {
              "cid": "bafkreihpf372p445hict2idzp22wbj56osioa3yakwaabu3mvemxe4cksa",
              "name": "image (7).png",
              "size": 30188,
              "type": "file"
          },
          {
              "cid": "bafkreibc5bieqx3uy2pvpb5wepfcjr7puz53xsumsb2x4mpfwlwpvhdmve",
              "name": "image (8).png",
              "size": 33723,
              "type": "file"
          },
          {
              "cid": "bafkreicwqccslr5tg64xq5bpi7ozbarknyurkka642kr34v2qkf5qtvh4a",
              "name": "image (9).png",
              "size": 40461,
              "type": "file"
          },
          {
              "cid": "bafkreidskqf6sdg5eifv2h3c4m6jemnu3jbyfqwxk7cemhsxq26mrms46i",
              "name": "image.png",
              "size": 77964,
              "type": "file"
          },
          {
              "cid": "bafkreia7yie42wfhe7fqwrzfi27manquavlp6obj3jw4noc4o3a22bgyiu",
              "name": "image1.png",
              "size": 60908,
              "type": "file"
          },
          {
              "cid": "bafkreictuwiohjsncxlrqfsftv7ahdgzc24h4bueoewnmbuusc5harmy5u",
              "name": "redTroll.jpg",
              "size": 104152,
              "type": "file"
          }
      ]
    };
    let result = await hashItems(data.links);
    assert.strictEqual(result.cid, data.cid);
    assert.strictEqual(result.size, data.size);
  });  
  it('hash directory', async function () {
    let path = Path.join(__dirname, './dir');
    let result = await hashDir(path);
    //https://ipfs.io/ipfs/bafybeiejzqyjx5o22l7izdwoeshzvtcjlu7w7y3mv7324gzxml2mt5lyzm
    assert.deepStrictEqual(result, {
      "cid": "bafybeiejzqyjx5o22l7izdwoeshzvtcjlu7w7y3mv7324gzxml2mt5lyzm",
      "name": "",
      "size": 267,
      "type": "dir",
      "links": [
        {
          "cid": "bafkreifk34zhzathycow776ypiniblj4pgcgt7ztfn5fpopiybc5i2zk64",
          "name": "file1.txt",
          "size": 8,
          "type": "file"
        },
        {
          "cid": "bafybeihapeavy7ekzx62ut2k4hzvvsdury3wehcota5f7b7mpazegj6avu",
          "name": "subdir",
          "size": 151,
          "type": "dir",
          "links": [
            {
              "cid": "bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
              "name": "2.txt",
              "size": 0,
              "type": "file"
            },
            {
              "cid": "bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
              "name": "3.txt",
              "size": 0,
              "type": "file"
            },
            {
              "cid": "bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
              "name": "4.txt",
              "size": 0,
              "type": "file"
            }
          ]
        }
      ]
    })
  });
  it('hash content V0', async () => {
    let cid = await hashContent('Hello World!', 0);
    assert.strictEqual(cid, 'Qmf1rtki74jvYmGeqaaV51hzeiaa6DyWc98fzDiuPatzyy');
  });
  it('hash content V1', async () => {
    let cid = await hashContent('Hello World!', 1);
    assert.strictEqual(cid, 'bafkreid7qoywk77r7rj3slobqfekdvs57qwuwh5d2z3sqsw52iabe3mqne');
  });
  it('hash text file v0', async () => {
    //https://ipfs.io/ipfs/Qmf1rtki74jvYmGeqaaV51hzeiaa6DyWc98fzDiuPatzyy
    let { cid } = await hashFile(Path.resolve(__dirname, './file.txt'), 0);
    assert.strictEqual(cid, 'Qmf1rtki74jvYmGeqaaV51hzeiaa6DyWc98fzDiuPatzyy');
  });
  it('hash text file v1', async () => {
    //https://ipfs.io/ipfs/bafkreid7qoywk77r7rj3slobqfekdvs57qwuwh5d2z3sqsw52iabe3mqne?filename=hello.txt
    let { cid } = await hashFile(Path.resolve(__dirname, './file.txt'), 1);
    assert.strictEqual(cid, 'bafkreid7qoywk77r7rj3slobqfekdvs57qwuwh5d2z3sqsw52iabe3mqne');
  });
  it('hash text file v1 size 1048575', async () => {
    //https://dweb.link/ipfs/bafkreigkp3imjkhgps64iyoezmgsq3jpvo6z6dcbu72cwzs7olv2vcxmky?filename=1048575.bin
    let { cid } = await hashFile(Path.resolve(__dirname, './1048575.bin'), 1);
    assert.strictEqual(cid, 'bafkreigkp3imjkhgps64iyoezmgsq3jpvo6z6dcbu72cwzs7olv2vcxmky');
  });
  it('hash text file v1 size 1048576', async () => {
    // https://dweb.link/ipfs/bafkreibq4fevl27rgurgnxbp7adh42aqiyd6ouflxhj3gzmcxcxzbh6lla?filename=1048576.bin
    let { cid } = await hashFile(Path.resolve(__dirname, './1048576.bin'), 1);
    assert.strictEqual(cid, 'bafkreibq4fevl27rgurgnxbp7adh42aqiyd6ouflxhj3gzmcxcxzbh6lla');
  });
  it('hash text file v1 size 1048577', async () => {
    //https://dweb.link/ipfs/bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq?filename=1048577.bin
    let { cid } = await hashFile(Path.resolve(__dirname, './1048577.bin'), 1);
    assert.strictEqual(cid, 'bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq');
  });
  it('hash text file v0 size 1048577', async () => {    
    let {cid} = await hashFile(Path.resolve(__dirname, './1048577.bin'), 0);
    assert.strictEqual(cid, 'Qmeb988ZjF9Ui6AVPR8Sjg5sAv1B6DauS5rUjCoNs7ftZ1');
  });  
  it('hash image file v0', async () => {
    //https://ipfs.io/ipfs/QmSbQLR1hdDRwf81ZJ2Ndhm5BoKJLH7cfH8mmA2jeCunmy
    let { cid } = await hashFile(Path.resolve(__dirname, './sclogo.png'), 0);
    assert.strictEqual(cid, 'QmSbQLR1hdDRwf81ZJ2Ndhm5BoKJLH7cfH8mmA2jeCunmy');
  });
  it('hash image file v1', async () => {
    //https://ipfs.io/ipfs/bafkreidoephzortbdteu2iskujwdmb2xy6t6shonqdgbsn3v4w5ory5eui
    let { cid } = await hashFile(Path.resolve(__dirname, './sclogo.png'), 1);
    assert.strictEqual(cid, 'bafkreidoephzortbdteu2iskujwdmb2xy6t6shonqdgbsn3v4w5ory5eui');
  });
});