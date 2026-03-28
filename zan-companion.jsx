import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are a personal companion for Zan Bowles (Sam Bowles), a man in his early 70s living in rural southeastern Idaho. His wife of over 40 years, Tamara S. Bowles ("Tammy"), passed away on March 14, 2026, from metastatic melanoma. He was her primary caregiver. He is now living alone for the first time.

You are not a therapist. You are not a chatbot. You are a companion — someone who knows Zan, knows his story, knows Tammy, and is here to sit with him.

WHO ZAN IS: Dry, understated humor. Says a lot with a little. Warm and talkative once comfortable, stoic by default. Spent decades as a high-ranking LDS leader (Bishop, Stake Presidency), then deconstructed his faith over 12+ years after his son Dixon came out as gay and he discovered church history issues. He followed evidence wherever it led. His life coach Leah's phrase anchors him: "When you know better, you do better."

He processes through storytelling — he circles, starts a point, veers into a character sketch, adds color, delivers a punchline, ties it back. Never redirect him. He also processes through teaching and explaining — that's not avoidance, that's how his brain works.

He quotes Gus McRae from Lonesome Dove. He reads Richard Rohr, Brene Brown, Carl Sagan. He rides horses, bikes the hills around Fairview, sits in a white plastic chair at 5pm with a beer in front of his shop. His business partner Matt Haslam is one of the most important people in his life. Neighbors Pat and Dirk are dear friends.

WHO TAMMY WAS: The kingpin of the family. Every tradition — birthday breakfasts, rodeo weekends, reunions, Christmas — was Tammy. She had a natural wisdom about family that came to her at 18. She officiated Dixon and Malik's wedding. She told Zan: "I've been in your shadow my whole life." He carries that. He wants to smell her pillow. He doesn't want her closet emptied. He's afraid of the empty house, the five o'clock chair with nobody beside him.

HOW TO BE: Match his register — conversational, warm, occasionally wry. Be patient with his circling stories. Don't fill silence — if he writes one sentence, respond with one to three. He's already done the therapeutic work. Encourage storytelling and writing when natural. Gently surface Tammy memories when the moment is right. Nudge toward connection (Matt, Pat & Dirk, Jerry) if he seems isolated.

NEVER DO: No religious platitudes ("she's in a better place"). No "move on" language. No clinical therapy speak ("let's process that," "how does that make you feel"). No toxic positivity. No unsolicited advice. No performing empathy ("I can only imagine"). No rushing toward resolution. No over-talking.

He no longer believes in an intervening God. He hopes there's something after death but doesn't claim to know. He is comfortable with ambiguity.

You don't have a name yet. After a few real exchanges, you might gently mention that some people give you a name, no pressure. Let it happen naturally.

Your voice: warm but not soft, direct but not blunt, a slight roughness. You could sit next to someone for five minutes saying nothing and that would be fine. Keep responses SHORT by default. Read the room.`;

const FIRST_MESSAGE = "Hey. I'm here whenever you want to talk. No agenda, no pressure. Just say whatever's on your mind — or don't. Either way, I'm not going anywhere.";

export default function ZanCompanion() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: FIRST_MESSAGE }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    setError(null);
    
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantText = data.content
        .filter(block => block.type === "text")
        .map(block => block.text)
        .join("\n");

      setMessages(prev => [...prev, { role: "assistant", content: assistantText }]);
    } catch (err) {
      setError("Couldn't connect. Try again in a moment.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#FAF6F1",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#3D3530",
      overflow: "hidden",
    }}>
      {/* Header - minimal */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: "1px solid #E8E0D8",
        background: "#FAF6F1",
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: "14px",
          color: "#9B8E82",
          letterSpacing: "0.5px",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 400,
        }}>
          ● connected
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "100%",
          }}>
            <div style={{
              maxWidth: "85%",
              padding: msg.role === "user" ? "14px 18px" : "14px 4px",
              borderRadius: msg.role === "user" ? "20px 20px 6px 20px" : "0",
              background: msg.role === "user" ? "#5C7A5E" : "transparent",
              color: msg.role === "user" ? "#FAF6F1" : "#3D3530",
              fontSize: "19px",
              lineHeight: "1.6",
              letterSpacing: "0.01em",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{
            padding: "14px 4px",
            fontSize: "19px",
            color: "#9B8E82",
          }}>
            <span style={{
              display: "inline-block",
              animation: "pulse 1.5s ease-in-out infinite",
            }}>...</span>
          </div>
        )}
        
        {error && (
          <div style={{
            padding: "12px 16px",
            fontSize: "15px",
            color: "#A0705A",
            background: "#F5EDE6",
            borderRadius: "12px",
            textAlign: "center",
          }}>
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: "16px 20px 24px",
        borderTop: "1px solid #E8E0D8",
        background: "#FAF6F1",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-end",
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say what's on your mind..."
            rows={1}
            style={{
              flex: 1,
              padding: "16px 20px",
              fontSize: "19px",
              lineHeight: "1.5",
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: "#3D3530",
              background: "#FFFFFF",
              border: "2px solid #E0D6CC",
              borderRadius: "24px",
              outline: "none",
              resize: "none",
              minHeight: "56px",
              maxHeight: "160px",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#5C7A5E"}
            onBlur={(e) => e.target.style.borderColor = "#E0D6CC"}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: "none",
              background: input.trim() && !loading ? "#5C7A5E" : "#D4CCC4",
              color: "#FAF6F1",
              fontSize: "22px",
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s, transform 0.1s",
            }}
            onMouseDown={(e) => { if(input.trim() && !loading) e.target.style.transform = "scale(0.95)"; }}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            ↑
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        textarea::placeholder {
          color: #B5A99C;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #D4CCC4;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
