// src/presentation/components/messages/mockData.ts
import type { Conversation, Message } from "./types";

export const CONVERSATIONS: Conversation[] = [
  { id: "1",  company: "Schlumberger",   avatar: "", lastMessage: "Your application for the 'Business Analyst' role is still under review...", time: "1 phút trước",  unread: 4,  online: true  },
  { id: "2",  company: "Woodplc",        avatar: "", lastMessage: "To proceed with your application for the 'Product Manager' role...",          time: "6 phút trước",  unread: 0,  online: false },
  { id: "3",  company: "Etihad Airways", avatar: "", lastMessage: "Dear Ana, Thank you for your interest in the 'Front-end Developer'...",         time: "7 phút trước",  unread: 0,  online: true  },
  { id: "4",  company: "IOGP",           avatar: "", lastMessage: "Good news! You've been shortlisted for the next stage...",                      time: "9 phút trước",  unread: 0,  online: false },
  { id: "5",  company: "Baker Hughes",   avatar: "", lastMessage: "We'd appreciate your feedback on your recent interview...",                     time: "10 phút trước", unread: 5,  online: false },
  { id: "6",  company: "Aramco",         avatar: "", lastMessage: "We wanted to inform you that the 'HR Coordinator' position has been closed...", time: "15 phút trước", unread: 5,  online: true  },
  { id: "7",  company: "Emirates Global",avatar: "", lastMessage: "We'd appreciate your feedback on your recent interview...",                     time: "16 phút trước", unread: 0,  online: false },
  { id: "8",  company: "Partners Success",avatar:"", lastMessage: "Oh, hello! All perfectly. I will check it and get back to you soon",            time: "23 phút trước", unread: 0,  online: true  },
  { id: "9",  company: "Weir",           avatar: "", lastMessage: "Thank you for applying for the 'Software Engineer' position...",                 time: "59 phút trước", unread: 1,  online: false },
  { id: "10", company: "Tuv-nord",       avatar: "", lastMessage: "We were impressed with your resume and would like to invite you...",             time: "22 giờ trước",  unread: 9,  online: false },
  { id: "11", company: "ADNOC",          avatar: "", lastMessage: "You're invited to our upcoming virtual career event...",                         time: "3 ngày trước",  unread: 0,  online: false },
];

export const MOCK_MESSAGES: Message[] = [
  { id: "1", type: "file",  fromMe: false, time: "2:45", content: "",          fileName: "Oh, hello! All perfectly will check.pdf", fileSize: "74.7 KB" },
  { id: "2", type: "file",  fromMe: false, time: "2:45", content: "",          fileName: "Oh, hello! All perfectly will check.pdf", fileSize: "74.7 KB" },
  { id: "3", type: "emoji", fromMe: false, time: "2:45", content: "😊" },
  { id: "4", type: "audio", fromMe: false, time: "2:45", content: "",          duration: "2:45" },
  { id: "5", type: "audio", fromMe: true,  time: "2:45", content: "",          duration: "2:45" },
  { id: "6", type: "text",  fromMe: true,  time: "2:45", content: "Oh, hello! All perfectly. I will check it and get back to you son Oh, hello! All perfectly. I will check it and get back to you soon" },
];