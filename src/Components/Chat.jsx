import React, { useEffect, useRef, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import io from "socket.io-client";

import {SERVER_URL} from '../config';
const socketURL = SERVER_URL;
const socket = io.connect(socketURL);
export default function Chat({ room, user ,setMessageNotification,messageNotification}) {
  const chatBox = useRef();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    socket.emit("join_chat_room", { room: room });
  }, []);
  const sendChat = () => {
    socket.emit("send-chat", {
      room: room,
      message: chatBox.current.value,
      sender: user,
    });
  };
  socket.off("receive-chat").on("receive-chat", (data) => {
    setChats((current) => [...current, data]);
    if(data.sender._id !== user._id)
    {
      setMessageNotification(messageNotification+1)
    }

  });

  return (
    <>
      <div
        className="offcanvas offcanvas-end"
       
        id="chatoffcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 id="offcanvasRightLabel">Chats</h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="h-100">
            <ScrollToBottom className="scroll-bottom">
              {chats.map((element) => {
                return (
                  <>
                    <div className="border-bottom mb-3">
                      <div className="d-flex">
                        <img
                          src={element.sender.picture_url}
                          className="tiny_pic"
                        />
                        <div className="d-flex align-items-center ms-2">
                          {element.sender.firstname +
                            " " +
                            element.sender.lastname}
                          <div className="mt-2 ms-2">
                            <i className="fa-solid fa-turn-down"></i>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 mb-2 form-control">
                        {element.message}
                      </div>
                    </div>
                  </>
                );
              })}
            </ScrollToBottom>
            <div className=" position-relative d-flex w-100 p-0 me-0 form-control align-items-center">
              <div className="d-flex justify-content-between w-100">
                <div className="w-100">
                  <input
                    ref={chatBox}
                    type="text"
                    className="form-control m-0 border-0"
                    placeholder="Type somthing..."
                  />
                </div>

                <div
                  className="d-flex align-items-center p-2 text-success fw-bold"
                  onClick={sendChat}
                  style={{ cursor: "pointer" }}
                >
                  send
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
