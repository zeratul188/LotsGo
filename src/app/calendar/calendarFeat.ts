import { LoginUser } from "../store/loginSlice";
import { query, collection, where, limit, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { firestore } from "@/utiils/firebase";
import { SetStateFn } from "@/utiils/utils";
import { Boss } from "../api/checklist/boss/route";
import { addToast, Selection } from "@heroui/react";
import { ShowWeek, WeekBox } from "./CalendarForm";
import { DateValue, getLocalTimeZone } from "@internationalized/date";
import { getWeekContents } from "../checklist/lib/checklistFeat";
import { decrypt } from "@/utiils/crypto";
import { RaidWork } from "../raids/model/types";

export type Calendar = {
    name: string,
    raidname: string,
    date: Date,
    memo: string
}
export type Guild = {
    name: string,
    calendars: Calendar[]
}

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

// 로그인된 캐릭터의 길드명 반환 함수
export async function getGuildName(): Promise<string> {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const decryptedApiKey = storedUser?.apiKey ? decrypt(storedUser.apiKey, secretKey) : null;
    if (storedUser) {
        const id = storedUser.id;

        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);
        const characterName = snapshot.docs[0].data().character;

        const lostarkRes = await fetch(`/api/lostark?value=${characterName}&code=1&key=${decryptedApiKey}`);

        if (lostarkRes.ok) {
            const data = await lostarkRes.json();
            if (data) {
                const guildName = data.GuildName ?? '';

                return guildName ? guildName : '';
            }
        }
    }

    return '';
}

// 길드 데이터 가져오는 함수
export async function loadGuild(setGuild: SetStateFn<Guild | null>) {
    const guildName = await getGuildName();
    if (guildName) {
        const q = query(collection(firestore, 'guilds'), where("name", "==", guildName), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            setGuild({
                name: '',
                calendars: []
            });
            return;
        }

        const data = snapshot.docs[0].data();
        const calendars: Calendar[] = [];
        for (const calender of data.calendars) {
            const item: Calendar = {
                name: calender.name,
                date: calender.date.toDate(),
                raidname: calender.raidname,
                memo: calender.memo
            }
            calendars.push(item);
        }
        const guild: Guild = data ? {
            name: data.name,
            calendars: calendars
        } : {
            name: '',
            calendars: []
        }
        setGuild(guild);
    } else {
        setGuild({
            name: '',
            calendars: []
        });
    }
}    

// 보스 데이터 가져오는 함수
export async function loadBosses(setBosses: SetStateFn<Boss[]>) {
    const snapshot = await getDocs(collection(firestore, 'boss'));
    const bosses: Boss[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        simple: doc.data().simple ? doc.data().simple : '',
        max: doc.data().max ?? 0,
        difficulty: doc.data().difficulty
    }));
    setBosses(bosses);
}

// 본인 일지 가져오는 함수
export async function loadWorks(setWorks: SetStateFn<Calendar[]>) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (!storedUser) return;
    const id = storedUser.id;
    const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
    const snapshot = await getDocs(q);
    const data = snapshot.docs[0].data();
    const works: Calendar[] = [];
    if (data.calendars) {
        for (const calender of data.calendars) {
            const item: Calendar = {
                name: calender.name,
                date: calender.date.toDate(),
                raidname: calender.raidname,
                memo: calender.memo
            }
            works.push(item);
        }
    }
    setWorks(works);
}

// 본인이 참여한 파티의 정보를 가져오는 함수
export async function loadWorksByParty(setPartyWorks: SetStateFn<RaidWork[]>) {
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (!storedUser) return;
    const res = await fetch(`/api/raids/calendars?userId=${storedUser.id}`);
    if (!res.ok) {
        let message = '요청 중 오류가 발생하였습니다.';
        try {
            const data = await res.json();
            message = data?.error ?? message;
        } catch {}
        addToast({
            title: `요청 오류`,
            description: message,
            color: "danger"
        });
        return;
    }
    const works: RaidWork[] = await res.json();
    const parsedWroks = works.map(w => ({
        ...w,
        date: new Date(w.date)
    }));
    setPartyWorks(parsedWroks);
}

// 주간 일정 데이터 초기화
export function initialWeekData(
    works: Calendar[], 
    guild: Guild | null, 
    setWeeks: SetStateFn<WeekBox[]>
) {
    const result: WeekBox[] = [];
    const today = new Date();
    const day = today.getDay();
    const diffToWednesday = ((day - 3 + 7) % 7);
    const wednesday = new Date(today);
    wednesday.setDate(today.getDate() - diffToWednesday);

    for (let i = 0; i < 7; i++) {
        const d = new Date(wednesday);
        d.setDate(wednesday.getDate() + i);
        const calenders: Calendar[] = [];
        works.filter(work => isSameDate(d, work.date)).forEach((work) => calenders.push(work));
        if (guild) {
            guild.calendars.filter(work => isSameDate(d, work.date)).forEach((work) => calenders.push(work));
        }
        const weekBox: WeekBox = {
            date: d,
            calendar: calenders
        }
        result.push(weekBox);
    }

    setWeeks(result);
}

// 두개의 Date 년, 월, 일 같은지 여부
export function isSameDate(aDate: Date, bDate:Date): boolean {
    return aDate.getFullYear() === bDate.getFullYear() &&
        aDate.getMonth() === bDate.getMonth() &&
        aDate.getDate() === bDate.getDate();
}

// 날짜 문구 출력 함수
export function formatKoreanDate(date: Date): string {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = days[date.getDay()];

    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${dayName} (${month}월 ${day}일)`;
}

// 시간 출력 함수
export function formatHours(date: Date): string {
    const hour = (date.getHours()).toString().padStart(2, '0');
    const miniute = (date.getMinutes()).toString().padStart(2, '0');
    return `${hour}시 ${miniute}분`;
}

// 일정을 등록하는 기능
export async function handleSubmitCalendar(
    title: string,
    raid: Selection,
    selectDate: DateValue | null,
    isTypeGuild: boolean,
    isEtc: boolean,
    memo: string,
    onClose: () => void,
    bosses: Boss[],
    setLoadingButton: SetStateFn<boolean>,
    works: Calendar[],
    setWorks: SetStateFn<Calendar[]>,
    guild: Guild | null,
    setGuild: SetStateFn<Guild | null>
) {
    if (title === '') {
        addToast({
            title: "입력 오류",
            description: `제목이 비어있습니다.`,
            color: "danger"
        });
        return;
    }
    if (!Array.from(raid)[0] && !isEtc) {
        addToast({
            title: "입력 오류",
            description: `콘텐츠를 선택하지 않았습니다.`,
            color: "danger"
        });
        return;
    }
    if (!selectDate?.toDate(getLocalTimeZone())) {
        addToast({
            title: "입력 오류",
            description: `날짜 입력에서 입력하지 않은 부분이 있습니다. 시간, 분까지 정확히 입력해주세요.`,
            color: "danger"
        });
        return;
    }

    setLoadingButton(true);
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;

    const raidObj = Array.from(raid)[0] ? getWeekContents(bosses, [], -1).find(boss => boss.key === Array.from(raid)[0].toString()) : null;
    const raidLabel = raidObj ? raidObj.name : '';

    const calendar: Calendar = {
        name: title,
        raidname: isEtc ? '' : raidLabel,
        date: selectDate?.toDate(getLocalTimeZone()),
        memo: memo
    }

    if (isTypeGuild) {
        try {
            const guildName = await getGuildName();
            if (guildName) {
                const q = query(collection(firestore, 'guilds'), where("name", "==", guildName), limit(1));
                const snapshot = await getDocs(q);
                
                if (snapshot.empty) {
                    const calendars: Calendar[] = [];
                    calendars.push(calendar);
                    const objGuild: Guild = {
                        name: guildName,
                        calendars: calendars
                    }
                    await addDoc(collection(firestore, 'guilds'), objGuild);
                    addToast({
                        title: "등록 완료",
                        description: `일정이 정상적으로 등록되었습니다.`,
                        color: "success"
                    });
                    setGuild(objGuild);
                } else {
                    const calenders: Calendar[] = guild ? guild.calendars.map(item => ({...item})) : [];
                    calenders.push(calendar);
                    const targetDoc = snapshot.docs[0];
                    const docRef = doc(firestore, "guilds", targetDoc.id);
                    await updateDoc(docRef, {
                        calendars: calenders
                    });
                    const objGuild: Guild = {
                        name: guildName,
                        calendars: calenders
                    }
                    setGuild(objGuild);
                }
                setLoadingButton(false);
                onClose();
            } else {
                addToast({
                    title: "길드 없음",
                    description: `대표 캐릭터로 가입된 길드가 없거나 데이터를 찾을 수 없습니다. 로스트아크 점검 시간에는 데이터가 불러오지 못하므로 점검 시간 이후에 시도해주시기 바랍니다.`,
                    color: "danger"
                });
                setLoadingButton(false);
            }
        } catch(error) {
            addToast({
                title: "데이터 로드 오류",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            setLoadingButton(false);
        }
    } else {
        try {
            const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
            const snapshot = await getDocs(q);
            const targetDoc = snapshot.docs[0];
            const calendars: Calendar[] = works.map(item => ({...item}));
            calendars.push(calendar);
            const docRef = doc(firestore, "members", targetDoc.id);
            await updateDoc(docRef, {
                calendars: calendars
            });
            setWorks(calendars);
            addToast({
                title: "등록 완료",
                description: `일정이 정상적으로 등록되었습니다.`,
                color: "success"
            });
            setLoadingButton(false);
            onClose();
        } catch(error) {
            addToast({
                title: "데이터 로드 오류",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            setLoadingButton(false);
        }
    }
}

// 주마다 해당되는 일정의 배열을 반환하는 함수
export function getCalendarByWeek(weekbox: WeekBox, calendars: Calendar[], guild: Guild | null): ShowWeek[] {
    const works: ShowWeek[] = [];
    for (const calendar of calendars) {
        if (isSameDate(weekbox.date, calendar.date)) {
            works.push({
                type: 'work',
                calendar: calendar
            });
        }
    }
    if (guild) {
        for (const calendar of guild.calendars) {
            if (isSameDate(weekbox.date, calendar.date)) {
                works.push({
                    type: 'guild',
                    calendar: calendar
                });
            }
        }
    }
    return works;
}

// 주마다 해당되는 파티 일정의 배열을 반환하는 함수
export function getCalendarByPartyWorks(weekbox: WeekBox, partyWorks: RaidWork[]): RaidWork[] {
    return partyWorks.filter(work => isSameDate(weekbox.date, work.date));
}

// 날짜 출력 변환 함수
export function formatDatetoString(date: Date): string {
    const year = (date.getFullYear()).toString().padStart(4, '0');
    const month = (date.getMonth()+1).toString().padStart(2, '0');
    const day = (date.getDate()).toString().padStart(2, '0');
    const hour = (date.getHours()).toString().padStart(2, '0');
    const miniute = (date.getMinutes()).toString().padStart(2, '0');
    return `${year}년 ${month}월 ${day}일 ${hour}시 ${miniute}분`;
}

// 메모 수정 클릭 이벤트 함수
export async function handleEditMemo(
    editMemo: string, 
    isTypeGuild: boolean,
    setLoadingMemo: SetStateFn<boolean>,
    guild: Guild | null,
    works: Calendar[],
    selectCalendar: Calendar,
    setWorks: SetStateFn<Calendar[]>,
    setGuild: SetStateFn<Guild | null>
) {
    setLoadingMemo(true);
    if (isTypeGuild) {
        const guildName = await getGuildName();
        if (guildName) {
            const calenders: Calendar[] = guild ? guild.calendars.map(item => ({...item})) : [];
            const findIndex = calenders.findIndex(calendar => (calendar.name === selectCalendar.name) && (calendar.date.getTime() === selectCalendar.date.getTime()));
            if (findIndex !== -1) {
                calenders[findIndex].memo = editMemo;
                const q = query(collection(firestore, 'guilds'), where("name", "==", guildName), limit(1));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const targetDoc = snapshot.docs[0];
                    const docRef = doc(firestore, "guilds", targetDoc.id);
                    await updateDoc(docRef, {
                        calendars: calenders
                    });
                    if (guild) {
                        const newGuild: Guild = structuredClone(guild);
                        newGuild.calendars = calenders;
                        setGuild(newGuild);
                        addToast({
                            title: "수정 완료",
                            description: `메모가 정상적으로 수정되었습니다.`,
                            color: "success"
                        });
                        setLoadingMemo(false);
                        return;
                    }
                }
            }
        }
    } else {
        const userStr = sessionStorage.getItem('user');
        const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
        const id = storedUser.id;
        const calendars: Calendar[] = works.map(item => ({...item}));
        const findIndex = calendars.findIndex(calendar => (calendar.name === selectCalendar.name) && (calendar.date.getTime() === selectCalendar.date.getTime()));
        if (findIndex !== -1) {
            calendars[findIndex].memo = editMemo;
            const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const targetDoc = snapshot.docs[0];
                const docRef = doc(firestore, "members", targetDoc.id);
                await updateDoc(docRef, {
                    calendars: calendars
                });
                setWorks(calendars);
                addToast({
                    title: "수정 완료",
                    description: `메모가 정상적으로 수정되었습니다.`,
                    color: "success"
                });
                setLoadingMemo(false);
                        return;
            }
        }
    }
    addToast({
        title: "데이터 로드 오류",
        description: `데이터를 가져오는데 문제가 발생하였습니다.`,
        color: "danger"
    });
    setLoadingMemo(false);
}

// 일정이 지난 일정 자동 삭제하기 - 길드 일정
export async function removeAutoCalendarsByGuild(
    guild: Guild | null,
    setGuild: SetStateFn<Guild | null>
) {
    const now = new Date();
    const guildName = await getGuildName();
    if (guildName && guild) {
        const guildCalendars: Calendar[] = [];
        for (const calendar of guild.calendars) {
            if (calendar.date.getTime() >= now.getTime()) {
                guildCalendars.push(calendar);
            }
        }
        const q = query(collection(firestore, 'guilds'), where("name", "==", guildName), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const targetDoc = snapshot.docs[0];
            const docRef = doc(firestore, "guilds", targetDoc.id);
            await updateDoc(docRef, {
                calendars: guildCalendars
            });
            const newGuild: Guild = structuredClone(guild);
            newGuild.calendars = guildCalendars;
            setGuild(newGuild);
        }
    }
}

// 일정이 지난 일정 자동 삭제하기 - 개인 일정
export async function removeAutoCalendarsByWorks(
    works: Calendar[],
    setWorks: SetStateFn<Calendar[]>
) {
    const calendars: Calendar[] = [];
    const now = new Date();
    for (const calendar of works) {
        if (calendar.date.getTime() >= now.getTime()) {
            calendars.push(calendar);
        }
    }
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);
        await updateDoc(docRef, {
            calendars: calendars
        });
        setWorks(calendars);
    }
}

// 일정 삭제 버튼 이벤트 함수
export async function handleRemoveCalendar(
    isTypeGuild: boolean,
    setLoadingDelete: SetStateFn<boolean>,
    guild: Guild | null,
    works: Calendar[],
    selectCalendar: Calendar,
    setWorks: SetStateFn<Calendar[]>,
    setGuild: SetStateFn<Guild | null>
) {
    setLoadingDelete(true);
    if (isTypeGuild) {
        const guildName = await getGuildName();
        if (guildName && guild) {
            const calenders: Calendar[] = guild ? guild.calendars.map(item => ({...item})) : [];
            const findIndex = calenders.findIndex(calendar => (calendar.name === selectCalendar.name) && (calendar.date.getTime() === selectCalendar.date.getTime()));
            if (findIndex !== -1) {
                const newGuildCalendars = calenders.filter((_, i) => i !== findIndex);
                const q = query(collection(firestore, 'guilds'), where("name", "==", guildName), limit(1));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const targetDoc = snapshot.docs[0];
                    const docRef = doc(firestore, "guilds", targetDoc.id);
                    await updateDoc(docRef, {
                        calendars: newGuildCalendars
                    });
                    if (guild) {
                        const newGuild: Guild = structuredClone(guild);
                        newGuild.calendars = newGuildCalendars;
                        setGuild(newGuild);
                        addToast({
                            title: "삭제 완료",
                            description: `일정이 정상적으로 삭제되었습니다.`,
                            color: "success"
                        });
                        setLoadingDelete(false);
                        return;
                    }
                }
            }
        } 
    } else {
        const userStr = sessionStorage.getItem('user');
        const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
        const id = storedUser.id;
        const calendars: Calendar[] = works.map(item => ({...item}));
        const findIndex = calendars.findIndex(calendar => (calendar.name === selectCalendar.name) && (calendar.date.getTime() === selectCalendar.date.getTime()));
        console.log(`finded index : ${findIndex}`);
        if (findIndex !== -1) {
            const newCalendars = calendars.filter((_, i) => i !== findIndex);
            const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const targetDoc = snapshot.docs[0];
                const docRef = doc(firestore, "members", targetDoc.id);
                await updateDoc(docRef, {
                    calendars: newCalendars
                });
                setWorks(newCalendars);
                addToast({
                    title: "삭제 완료",
                    description: `일정이 정상적으로 삭제제되었습니다.`,
                    color: "success"
                });
                setLoadingDelete(false);
                return;
            }
        }
    }
}

// 일정 날짜 항목이 오늘인지 확인 여부
export function isTodayDate(date: Date): boolean {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

export type TodoDate = {
    works: Calendar[],
    guildWorks: Calendar[],
    date: Date
}
// 달력 표시 함수
export function getCalendarDates(year: number, month: number): Date[] {
  const dates: Date[] = [];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay(); // 요일 (0: 일, 6: 토)
  const totalDays = lastDayOfMonth.getDate();

  // 이전 달에서 채워야 할 빈 칸
  for (let i = 0; i < startDay; i++) {
    dates.push(new Date(year, month, i - startDay + 1)); // 이전 달 날짜
  }

  // 이번 달 날짜
  for (let i = 1; i <= totalDays; i++) {
    dates.push(new Date(year, month, i));
  }

  // 다음 달까지 채우기 (총 6줄 = 42칸 기준)
  while (dates.length < 42) {
    const lastDate = dates[dates.length - 1];
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + 1);
    dates.push(nextDate);
  }

  return dates;
}

// 당일인 일정 배열 반환 함수
export function getCalendarByDay(date: Date, calendars: Calendar[], guild: Guild | null): ShowWeek[] {
    const works: ShowWeek[] = [];
    for (const calendar of calendars) {
        if (isSameDate(date, calendar.date)) {
            works.push({
                type: 'work',
                calendar: calendar
            });
        }
    }
    if (guild) {
        for (const calendar of guild.calendars) {
            if (isSameDate(date, calendar.date)) {
                works.push({
                    type: 'guild',
                    calendar: calendar
                });
            }
        }
    }
    return works;
}

// 당일인 파티 일정 배열 반환 함수
export function getCalendarByPartyDay(date: Date, works: RaidWork[]): RaidWork[] {
    return works.filter(work => isSameDate(date, work.date));
}
