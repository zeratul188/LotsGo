import { loadCalendar, loadEvents, loadNotices } from "./home/calendarFeat";
import HomeClient from "./HomeClient";
import Cookies from 'js-cookie';

export default async function Home(props: any) {
  const apiKey = Cookies.get('userApiKey');

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
      islandTime={calendarData.islandTime}
      isInspection={calendarData.isInspection}
      notices={notices}
      events={events}/>
  )
}
