import axios from "axios";
import data from './data.json';

const LOSTARK_API_BASE = data.lostarkAPIBase;
const API_KEY = process.env.NEXT_PUBLIC_LOSTARK_API_KEY;

export async function getData(link: string) {
    const res = await axios.get(`${LOSTARK_API_BASE}${link}`, {
        headers: {
            Authorization: `bearer ${API_KEY}`
        }
    });
    return res.data;
}