const blockedTerms = [
  'เหี้ย',
  'ไอ้เหี้ย',
  'อีเหี้ย',
  'สัส',
  'สัด',
  'ไอ้สัตว์',
  'ควย',
  'ไอ้ควาย',
  'ควาย',
  'หี',
  'เย็ด',
  'แตด',
  'จิ๋ม',
  'จู๋',
  'หำ',
  'มึง',
  'ระยำ',
  'ห่า',
  'แม่ง',
  'ชิบหาย',
  'ส้นตีน',
  'ตอแหล',
  'อีดอก',
  'ดอกทอง',
  'กะหรี่',
  'กระหรี่',
  'ปัญญาอ่อน',
  'โป๊',
  'ลามก',
  'เปลือย',
  'หัวนม',
  'ของลับ',
  'อวัยวะเพศ',
  'เสียว',
  'น้ำแตก',
  'แตกใน',
  'ดูดควย',
  'เลียหี',
  'ข่มขืน',
  'fuck',
  'fucking',
  'fucker',
  'shit',
  'asshole',
  'bitch',
  'slut',
  'whore',
  'cunt',
  'dick',
  'cock',
  'pussy',
  'sex',
  'sexy',
  'porn',
  'porno',
  'xxx',
  'nude',
  'nudes',
  'onlyfans',
  'blowjob',
  'handjob',
  'anal',
  'rape',
  'rapist',
  'orgasm',
  'cum',
  'masturbate'
];

const normalizeText = (text = '') => {
  return String(text)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}+]+/gu, '');
};

const hasInappropriateContent = (text) => {
  const normalizedText = normalizeText(text);
  return blockedTerms.some(term => normalizedText.includes(normalizeText(term)));
};

module.exports = {
  blockedTerms,
  hasInappropriateContent,
  normalizeText
};
