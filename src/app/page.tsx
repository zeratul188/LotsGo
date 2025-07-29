import { decrypt } from "@/utiils/crypto";
import HomeClient from "./HomeClient";
import { cookies } from 'next/headers';
import { loadCalendar, loadEvents, loadNotices } from "./home/calendarServer";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

export default async function Home() {
  const cookieStore = cookies();
  const cookieApiKey = (await cookieStore).get('userApiKey')?.value;
  let apiKey = undefined;
  if (cookieApiKey) {
    apiKey = decrypt(cookieApiKey, secretKey);
  }

  const [calendarData, notices, events] = await Promise.all([
      loadCalendar(apiKey),
      loadNotices(apiKey),
      loadEvents(apiKey)
  ]);

  return (
    <HomeClient
      gate={calendarData.gate}
      boss={calendarData.boss}
      islands={calendarData.islands}
      islandTime={calendarData.islandTime ? calendarData.islandTime.format() : null}
      islandDatas={calendarData.islandDatas}
      isInspection={calendarData.isInspection}
      notices={notices}
      events={events}/>
  )
}
