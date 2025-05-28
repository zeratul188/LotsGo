import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const firestore = admin.firestore();
const database = admin.database();

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
                checklist: checklistSection.map((item: any) => ({
                    ...item,
                    isDisable: item.isBiweekly && item.isCheck && (biweekly%2 === 1),
                    isCheck: false
                })),
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