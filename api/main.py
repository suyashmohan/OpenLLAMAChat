import os
import asyncio
from typing import AsyncIterable, Awaitable
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chat_models.openai import ChatOpenAI
from langchain.schema import HumanMessage

app = FastAPI()
os.environ["OPENAI_API_KEY"] = ""

class Message(BaseModel):
    content: str

async def send_message(message: str) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    model = ChatOpenAI(
        streaming=True,
        verbose=True,
        callbacks=[callback],
    )

    # Begin a task that runs in the background.
    task = asyncio.create_task(
        model.agenerate(messages=[[HumanMessage(content=message)]])
    )

    async for token in callback.aiter():
        # Use server-sent-events to stream the response
        yield f"{token}"

    await task

@app.post("/api/chat")
async def chat(message: Message):
    return StreamingResponse(send_message(message.content), media_type="text/event-stream")

