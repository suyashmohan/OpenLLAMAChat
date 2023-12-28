import asyncio
from typing import AsyncIterable
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chat_models.ollama import ChatOllama
from langchain.schema import HumanMessage

app = FastAPI()

class Message(BaseModel):
    content: str

async def send_message(content: str) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    model = ChatOllama(
        model="mistral",
        callbacks=[callback]
    )

    task = asyncio.create_task(
        model.agenerate(messages=[[HumanMessage(content=content)]])
    )

    try:
        async for token in callback.aiter():
            yield token
    except Exception as e:
        print(f"Caught Exception: {e}")
    finally:
        callback.done.set()
    
    await task

@app.post("/api/chat")
async def chat(message: Message):
    generator = send_message(message.content)
    return StreamingResponse(generator, media_type="text/event-stream")

