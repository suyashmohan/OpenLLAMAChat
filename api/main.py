import asyncio
from typing import AsyncIterable, List

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chat_models.ollama import ChatOllama
from langchain.schema import BaseMessage, HumanMessage, AIMessage

origins = [
    "http://localhost:5173",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class Chat(BaseModel):
    messages: List[ChatMessage]

async def send_message(messages: List[List[BaseMessage]]) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    model = ChatOllama(
        model="mistral",
        callbacks=[callback],
    )

    # Begin a task that runs in the background.
    task = asyncio.create_task(
        model.agenerate(messages)
    )

    async for token in callback.aiter():
        # Use server-sent-events to stream the response
        yield f"{token}"

    await task

@app.post("/api/chat") 
async def chatapi(chat: Chat):
    messages : List[List[BaseMessage]] = [[]]
    for msg in chat.messages:
        if msg.role == "user":
            messages[0].append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            messages[0].append(AIMessage(content=msg.content))
    print(messages)
    return StreamingResponse(send_message(messages), media_type="text/event-stream")

