import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession as auth } from "@/lib/jwt";

interface ChatMessage {
    sender: "user" | "model";
    text: string;
}

interface ChatRequestBody {
    message?: string;
    previousMessages?: ChatMessage[];
    guestId?: string;
    attachmentUrl?: string;
    attachmentType?: string;
}

export async function POST(req: Request) {
    try {
        const { message, previousMessages, guestId, attachmentUrl, attachmentType }: ChatRequestBody = await req.json();
        const session = await auth();

        if (!message && !attachmentUrl) {
            return NextResponse.json({ error: "Message or attachment is required" }, { status: 400 });
        }

        if (!session?.user && !guestId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // --- Store/Find Chat ---
        const userId = session?.user?.id;
        let chat;

        if (userId) {
            chat = await prisma.chat.findFirst({
                where: { users: { some: { id: userId } }, isGroup: false },
                orderBy: { updatedAt: "desc" }
            });
            if (!chat) {
                chat = await prisma.chat.create({
                    data: {
                        users: { connect: { id: userId } },
                        title: `Conversa com ${session!.user!.name || "Utilizador"}`
                    }
                });
            }
        } else if (guestId) {
            chat = await prisma.chat.findFirst({
                where: { guestId: guestId },
                orderBy: { updatedAt: "desc" }
            });
            if (!chat) {
                chat = await prisma.chat.create({
                    data: {
                        guestId: guestId,
                        title: `Chat Convidado: ${guestId.substring(0, 8)}`
                    }
                });
            }
        }

        // Save User Message
        if (chat) {
            await prisma.chatMessage.create({
                data: {
                    content: message || (attachmentUrl ? "Ficheiro enviado" : ""),
                    attachmentUrl,
                    attachmentType,
                    chatId: chat.id,
                    senderId: userId || null,
                }
            });
        }

        // 1. Check database for BotRules (Keyword matching)
        const rules = await prisma.botRule.findMany({
            where: { active: true }
        });

        const matchedRule = message ? rules.find(rule =>
            message.toLowerCase().includes(rule.trigger.toLowerCase())
        ) : undefined;

        if (matchedRule) {
            const responseText = matchedRule.response;
            if (chat) {
                await prisma.chatMessage.create({
                    data: {
                        content: responseText,
                        chatId: chat.id,
                        senderId: null,
                    }
                });
            }
            return NextResponse.json({
                text: responseText,
                source: "rule"
            });
        }

        // 2. Fallback to AI if Google API Key is present
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (apiKey) {
            try {
                // Fetch company context to make AI more accurate
                const [services, projects] = await Promise.all([
                    prisma.service.findMany({ where: { active: true }, select: { title: true, description: true } }),
                    prisma.project.findMany({ where: { active: true }, take: 5, select: { title: true, category: true } })
                ]);

                const context = `
                    Serviços disponíveis: ${services.map(s => s.title).join(", ")}.
                    Projectos recentes: ${projects.map(p => p.title).join(", ")}.
                    A VA Tech é uma empresa Angolana.
                `;

                const genAI = new GoogleGenerativeAI(apiKey);
                // Based on tests, gemini-2.5-flash is working perfectly for this key
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const chatSession = model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{
                                text: `Você é o Assistente Virtual da VA Tech (Angola). 
                            Informação da Empresa: ${context}
                            Seja profissional, prestativo e direto. Use emojis ocasionalmente. 
                            Se o utilizador perguntar por preços ou algo muito específico, sugira falar com um especialista via WhatsApp.` }],
                        },
                        {
                            role: "model",
                            parts: [{ text: "Com certeza! Sou o Assistente Virtual da VA Tech. Como posso ajudar com as nossas soluções tecnológicas hoje?" }],
                        },
                        ...(previousMessages || []).map((m: ChatMessage) => ({
                            role: m.sender === "user" ? "user" : "model",
                            parts: [{ text: m.text }],
                        }))
                    ],
                });

                try {
                    const result = await chatSession.sendMessage(message || "");
                    const response = await result.response;
                    const text = response.text();

                    if (chat) {
                        await prisma.chatMessage.create({
                            data: {
                                content: text,
                                chatId: chat.id,
                                senderId: null,
                            }
                        });
                    }

                    return NextResponse.json({
                        text,
                        source: "ai"
                    });
                } catch (sendError: unknown) {
                    const errorMessage = sendError instanceof Error ? sendError.message : "Unknown error";
                    console.error("AI First Attempt Failed (1.5-flash):", errorMessage);
                    // Final fallback to flash-latest
                    try {
                        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const fallbackResult = await fallbackModel.generateContent(message!); // message is checked at start
                        const fallbackResponse = await fallbackResult.response;
                        const fallbackText = fallbackResponse.text();

                        if (chat) {
                            await prisma.chatMessage.create({
                                data: {
                                    content: fallbackText,
                                    chatId: chat.id,
                                    senderId: null,
                                }
                            });
                        }

                        return NextResponse.json({
                            text: fallbackText,
                            source: "ai-fallback"
                        });
                    } catch (fallbackError: unknown) {
                        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : "Unknown fallback error";
                        console.error("All AI models failed:", fallbackErrorMessage);
                        throw fallbackError;
                    }
                }
            } catch (aiError) {
                console.error("AI Route Internal Error:", aiError);
            }
        }

        const fallbackResponseText = "Obrigado pela sua mensagem. No momento estamos a processar o seu pedido. Para um atendimento mais rápido, pode contactar-nos diretamente via WhatsApp.";

        if (chat) {
            await prisma.chatMessage.create({
                data: {
                    content: fallbackResponseText,
                    chatId: chat.id,
                    senderId: null,
                }
            });
        }

        // 3. Default fallback
        return NextResponse.json({
            text: fallbackResponseText,
            source: "default"
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
