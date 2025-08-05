import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { onRequest } from "firebase-functions/v2/https";
import Redis from 'ioredis';

admin.initializeApp();
const firestore = admin.firestore();
const database = admin.database();

type RelicBook = {
  name: string,
  icon: string,
  price: number
}

// 1시간마다 최신 유물 각인서 가격 저장하기
export const updateRelicsBook = onRequest({
    secrets: ['LOSTARK_API_KEY']
}, async (req, res) =>  {
  try {
    const url = "https://developer-lostark.game.onstove.com/markets/items";
    const apiKey = process.env.LOSTARK_API_KEY;

    let page = 1;
    const allItems: RelicBook[] = [];
    const body = {
      Sort: "CURRENTMINPRICE",
      CategoryCode: 40000,
      ItemGrade: "유물",
      SortCondition: "DESC",
    };

    while(true) {
      console.log(`📄 페이지 ${page} 요청 중...`);

      const res = await axios.post(
        url,
        { ...body, PageNo: page },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      )

      const items = res.data.Items;
      if (!items || items.length === 0) {
        break;
      }

      for (const item of items) {
        const newItem: RelicBook = {
          name: item.Name,
          icon: item.Icon,
          price: item.CurrentMinPrice
        }
        allItems.push(newItem);
      }

      const pageSize = res.data.PageSize;
      if (pageSize) {
        if (items.length < pageSize) {
          break;
        }
      } else {
        break;
      }

      page++;
    }

    if (allItems.length > 0) {
      const relicsRef = database.ref('/relics');
      await relicsRef.set(allItems);
    }

    res.send("✅ 데이터 적용 완료");
  } catch (error) {
    console.error('Reset failed:', error);
    res.status(500).send('Reset failed');
  }
})

type RelicList = {
  year: number,
  month: number,
  day: number,
  price: number
}
type RelicItem = {
  name: string,
  list: RelicList[]
}

// 매일 12시 30분에 유각 시세 기록하기
export const writeRelicsBookPrice = functions.https.onRequest(async (req, res) => {
  try {
    const relicsRef = database.ref('/relics');
    const relicsSnapshot = await relicsRef.once('value');
    const relics = relicsSnapshot.val();
    const relicsArray: RelicBook[] = Object.values(relics);

    const storeRelicsRef = firestore.collection('relics');
    const snapshotRelics = await storeRelicsRef.get();
    const batch = firestore.batch();

    for (const item of relicsArray) {
      let isFound = false;
      snapshotRelics.forEach((doc) => {
        const data = doc.data();
        if (item.name === data.name) {
          let list: RelicList[] = data.list;
          const today = new Date();
          const newList: RelicList = {
            year: today.getFullYear(),
            month: today.getMonth()+1,
            day: today.getDate(),
            price: item.price
          }
          const findIndex = data.list.findIndex((i: any) => i.year === newList.year && i.month === newList.month && i.day === newList.day );
          if (findIndex === -1) {
            list.push(newList);

            //1년이 지난 데이터 삭제
            const now = new Date();
            const oneYearAgo = new Date(now);
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            list = list.filter(item => {
              const itemDate = new Date(item.year, item.month - 1, item.day);
              return itemDate >= oneYearAgo;
            })

            const docRef = storeRelicsRef.doc(doc.id);
            batch.update(docRef, { list: list });
          }
          isFound = true;
        }
      });
      if (!isFound) {
        const list: RelicList[] = [];
        const today = new Date();
        const newList: RelicList = {
          year: today.getFullYear(),
          month: today.getMonth()+1,
          day: today.getDate(),
          price: item.price
        }
        list.push(newList);
        const newItem: RelicItem = {
          name: item.name,
          list: list
        }
        const newDocRef = storeRelicsRef.doc();
        batch.create(newDocRef, newItem);
      }
    }

    await batch.commit();
    res.status(200).send('✅ 데이터 적용 완료');
  } catch (error) {
    console.error('Reset failed:', error);
    res.status(500).send('Reset failed');
  }
})

// 매주 6시에 주간 숙제 초기화 함수
export const resetWeekChecklist = functions.https.onRequest(async (req, res) => {
  try {
    const biweeklyRef = database.ref('/checklist/biweekly');
    const biweeklySnapshot = await biweeklyRef.once('value');
    let biweekly: number = Number(biweeklySnapshot.val());
    biweekly++;

    await biweeklyRef.set(biweekly);

    const membersRef = firestore.collection('members');
    const snapshot = await membersRef.get();
    const batch = firestore.batch();

    snapshot.forEach(doc => {
        const data = doc.data();
        const checklist = data.checklist;
        if (!Array.isArray(checklist)) return;

        const updatedChecklist = checklist.map(section => {
            const checklistSection = Array.isArray(section.checklist) ? section.checklist : [];
            const weeklist = Array.isArray(section.weeklist) ? section.weeklist : [];
            const updatedSection = {
                ...section,
                checklist: checklistSection.map((item: any) => {
                  const itemsSection = Array.isArray(item.items) ? item.items : [];
                  return {
                      ...item,
                      items: itemsSection.map((it: any) => ({
                        ...it,
                        isBonus: false,
                        isCheck: false
                      }))
                  }
                }),
                otherGold: 0,
                weeklist: weeklist.map((list: any) => ({
                    ...list,
                    isCheck: false
                }))
            }
            return updatedSection;
        });
        const docRef = membersRef.doc(doc.id);
        batch.update(docRef, { checklist: updatedChecklist })
    });

    await batch.commit();
    res.status(200).send('Daily reset complete');
  } catch (error) {
    console.error('Reset failed:', error);
    res.status(500).send('Reset failed');
  }
});

// 매일 6시에 일일 숙제 초기화 함수
export const resetDayChecklist = functions.https.onRequest(async (req, res) => {
  try {
    const membersRef = firestore.collection('members');
    const snapshot = await membersRef.get();
    const batch = firestore.batch();

    snapshot.forEach(doc => {
        const data = doc.data();
        const checklist = data.checklist;
        if (!Array.isArray(checklist)) return;

        const updatedChecklist = checklist.map(section => {
            const day = section.day || {};
            const daylist = Array.isArray(section.daylist) ? section.daylist : [];

            const currentDungeonBonus = day.dungeonBouus ?? 0;
            const currentBossBonus = day.bossBonus ?? 0;
            const currentQuestBonus = day.questBonus ?? 0;

            const dungeon = day.dungeon ?? 0;
            const boss = day.boss ?? 0;
            const quest = day.quest ?? 0;

            let newDungeonBonus = currentDungeonBonus + (1 - dungeon) * 20;
            newDungeonBonus = Math.min(newDungeonBonus, 200);

            let newBossBonus = currentBossBonus + (1 - boss) * 10;
            newBossBonus = Math.min(newBossBonus, 100);

            let newQuestBonus = currentQuestBonus + (3 - quest) * 10;
            newQuestBonus = Math.min(newQuestBonus, 100);
            const updatedSection = {
                ...section,
                day: {
                    dungeon: 0,
                    dungeonBouus: newDungeonBonus,
                    dungeonUsing: 0,
                    boss: 0,
                    bossBonus: newBossBonus,
                    bossUsing: 0,
                    quest: 0,
                    questBonus: newQuestBonus,
                    questUsing: 0
                },
                daylist: daylist.map((item: any) => ({
                    ...item,
                    isCheck: false
                }))
            }
            return updatedSection;
        });
        const docRef = membersRef.doc(doc.id);
        batch.update(docRef, { checklist: updatedChecklist })
    });

    await batch.commit();
    res.status(200).send('Daily reset complete');
  } catch (error) {
    console.error('Reset failed:', error);
    res.status(500).send('Reset failed');
  }
});

// 수요일 10시 10분에 캐시 데이터를 자동 삭제하는 기능 추가
export const removeCacheCalendarData = onRequest({
  secrets: ['REDIS_URL']
}, async (req, res) => {
  const redisUrl = process.env.REDIS_URL;

  try {
    if (!redisUrl) {
      console.error('REDIS_URL is undefined');
      res.status(500).send('Secrets failed');
    } else {
      const redis = new Redis(redisUrl!, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        tls: {}
      });

      redis.on('error', (err) => {
        console.error('[Redis 오류 발생]', err);
        res.status(500).send('Redis failed');
      });

      await redis.connect();
      await redis.del('calendar');
      await redis.del('events');
      await redis.del('notices');
      await redis.quit();
      res.status(200).send('Caches reset complete');
    }
  } catch (error) {
    console.error('Reset failed:', error);
    res.status(500).send('Reset failed');
  }
})

// firebase functions:secrets:set LOSTARK_API_KEY
// firebase deploy --only functions:resetWeekChecklist
