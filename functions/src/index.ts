import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
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
          name: item.Name.replaceAll('유물 ', ''),
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
export const resetWeekChecklist = onRequest({
  timeoutSeconds: 300, // 5분
  memory: "512MiB",    // 메모리
  region: "asia-northeast3" // 리전
}, async (req, res) => {
  try {
    functions.logger.info("ENTER resetWeekChecklist");
    const biweeklyRef = database.ref('/checklist/biweekly');
    const biweeklySnapshot = await biweeklyRef.once('value');
    let biweekly: number = Number(biweeklySnapshot.val());
    biweekly++;

    await biweeklyRef.set(biweekly);

    const membersRef = firestore.collection('members');
    const snapshot = await membersRef.get();

    const updates: any[] = [];

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
                      items: itemsSection.map((it: any) => {
                        let isDisable = it.isDisable;
                        let isBiweekly = it.isBiweekly ?? false;
                        if (!isDisable) {
                          if (it.isCheck && isBiweekly && biweekly%2 === 1) {
                            isDisable = true;
                          }
                        }
                        if (biweekly%2 === 0) {
                          isDisable = false;
                        }
                        return {
                          ...it,
                          isCheck: false,
                          isDisable: isDisable
                        }
                      })
                  }
                }),
                otherGold: 0,
                otherGoldRecords: [],
                hallsHourglassCheck: false,
                paradiseCheck: false,
                weeklist: weeklist.map((list: any) => ({
                    ...list,
                    isCheck: false
                }))
            }
            return updatedSection;
        });
        const docRef = membersRef.doc(doc.id);
        updates.push({
          ref: docRef,
          data : { checklist: updatedChecklist }
        });
    });

    for (let i = 0; i < updates.length; i += 450) {
      const chunk = updates.slice(i, i+450);
      const batch = firestore.batch();
      for (const u of chunk) {
        batch.update(u.ref, u.data);
      }
      await batch.commit();
    } 

    functions.logger.info('resetWeekChecklist success');
    res.status(200).send('Daily reset complete');
  } catch (error) {
    console.error('Reset failed:', error);
    functions.logger.error('resetWeekChecklist failed', error as any);
    res.status(500).send('Reset failed');
  }
});

// 매일 6시에 일일 숙제 초기화 함수
export const resetDayChecklist = onRequest({
  timeoutSeconds: 300, // 5분
  memory: "512MiB",    // 메모리
  region: "asia-northeast3" // 리전
}, async (req, res) => {
  try {
    functions.logger.info("ENTER resetDayChecklist");
    const membersRef = firestore.collection('members');
    const snapshot = await membersRef.get();

    const updates: any[] = [];

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
        updates.push({
          ref: docRef,
          data : { checklist: updatedChecklist }
        });
    });

    for (let i = 0; i < updates.length; i += 450) {
      const chunk = updates.slice(i, i+450);
      const batch = firestore.batch();
      for (const u of chunk) {
        batch.update(u.ref, u.data);
      }
      await batch.commit();
    } 

    functions.logger.info('resetDayChecklist success');
    res.status(200).send('Daily reset complete');
  } catch (error) {
    console.error('Reset failed:', error);
    functions.logger.error('resetDayChecklist failed', error as any);
    res.status(500).send('Reset failed');
  }
});

// 매주 수요일 오전 10시 5분(한국 시간)에 공지·이벤트 캐시 삭제
export const removeCacheCalendarData = onSchedule({
  schedule: '5 10 * * 3',
  timeZone: 'Asia/Seoul',
  secrets: ['REDIS_URL']
}, async () => {
  const redisUrl = process.env.REDIS_URL;

  try {
    if (!redisUrl) {
      throw new Error('REDIS_URL is undefined');
    }

    const redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      tls: {}
    });

    await redis.connect();
    const deletedKeys = await redis.del('calendar', 'events', 'notices:v2');
    await redis.quit();

    functions.logger.info('Scheduled cache reset complete', {
      deletedKeys,
      schedule: 'Wednesday 10:05 Asia/Seoul'
    });
  } catch (error) {
    functions.logger.error('Scheduled cache reset failed', error as any);
    throw error;
  }
});

type GemPriceValue = {
  price: number | null,
  icon: string | null,
  grade: string | null,
  name: string | null
}

type GemAuctionItem = {
  Name?: string,
  Icon?: string,
  Grade?: string,
  AuctionInfo?: {
    BuyPrice?: number
  }
}

type GemAuctionResponse = {
  Items?: GemAuctionItem[]
}

const GEM_LEVELS = [5, 6, 7, 8, 9, 10];
const GEM_CATEGORY_CODE = 210000;

function createEmptyGemPrice(): GemPriceValue {
  return { price: null, icon: null, grade: null, name: null };
}

function selectLowerGemPrice(current: GemPriceValue, item: GemAuctionItem): GemPriceValue {
  const price = Number(item.AuctionInfo?.BuyPrice);
  if (!Number.isFinite(price) || price <= 0) return current;
  if (current.price !== null && current.price <= price) return current;

  return {
    price,
    icon: typeof item.Icon === 'string' ? item.Icon : null,
    grade: typeof item.Grade === 'string' ? item.Grade : null,
    name: typeof item.Name === 'string' ? item.Name : null
  };
}

async function loadScheduledGemAuctionPrice(apiKey: string, level: number, kind: '겁화' | '작열'): Promise<GemPriceValue> {
  const response = await axios.post<GemAuctionResponse>(
    'https://developer-lostark.game.onstove.com/auctions/items',
    {
      Sort: 'BUY_PRICE',
      CategoryCode: GEM_CATEGORY_CODE,
      CharacterClass: null,
      ItemTier: 4,
      ItemGrade: null,
      ItemLevel: null,
      ItemName: `${level}레벨 ${kind}의 보석`,
      PageNo: 0,
      SortCondition: 'ASC'
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  let result = createEmptyGemPrice();

  for (const item of response.data.Items ?? []) {
    result = selectLowerGemPrice(result, item);
  }

  return result;
}

// 한국 시간 기준 00·03·06·09·12·15·18·21시에 공용 보석 시세 갱신
export const updateGemPrices = onSchedule({
  schedule: '0 */3 * * *',
  timeZone: 'Asia/Seoul',
  region: 'asia-northeast3',
  timeoutSeconds: 120,
  secrets: ['LOSTARK_API_KEY']
}, async () => {
  const apiKey = process.env.LOSTARK_API_KEY;
  if (!apiKey) throw new Error('LOSTARK_API_KEY is undefined');

  const entries = await Promise.all(
    GEM_LEVELS.map(async (level) => {
      const [damage, cooldown] = await Promise.all([
        loadScheduledGemAuctionPrice(apiKey, level, '겁화'),
        loadScheduledGemAuctionPrice(apiKey, level, '작열')
      ]);
      const prices = [damage.price, cooldown.price]
        .filter((price): price is number => price !== null);
      return [String(level), {
        lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
        damage,
        cooldown
      }] as const;
    })
  );
  const levels = Object.fromEntries(entries);

  await database.ref('/gem-prices/current').set({
    version: 1,
    updatedAt: Date.now(),
    levels
  });

  functions.logger.info('Gem price snapshot updated', {
    levels: GEM_LEVELS.length,
    schedule: 'Every 3 hours Asia/Seoul'
  });
});

// firebase functions:secrets:set LOSTARK_API_KEY
// firebase deploy --only functions:resetWeekChecklist
