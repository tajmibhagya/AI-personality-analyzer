import streamlit as st
import requests
import plotly.graph_objects as go

API_URL = st.secrets.get("API_URL", "http://127.0.0.1:8001")

st.set_page_config(page_title="Personality Analyzer", page_icon="🧠", layout="wide")

st.title("🧠 AI Personality Analyzer")
st.caption("Big Five personality + emotional tone, estimated from text.")

with st.sidebar:
    st.header("About")
    st.markdown(
        """
        Estimates **Big Five** traits and **emotional tone** from a writing sample.

        **Models**
        - Personality: `Minej/bert-base-personality`
        - Emotion: `j-hartmann/emotion-english-distilroberta-base`

        **Caveats**
        - Results are probabilistic estimates, not diagnostic claims.
        - Short texts and code-switched / non-English text reduce accuracy.
        - Best with 100+ words of natural prose.
        """
    )

text = st.text_area(
    "Paste a paragraph or writing sample",
    height=220,
    placeholder="Journal entry, blog post, long message — anything where you wrote naturally.",
)

if st.button("Analyze", type="primary"):
    if len(text.strip()) < 50:
        st.warning("Please enter at least 50 characters.")
    else:
        with st.spinner("Analyzing..."):
            try:
                res = requests.post(
                    f"{API_URL}/analyze", json={"text": text}, timeout=120
                )
                data = res.json()
            except requests.exceptions.RequestException as e:
                st.error(f"Could not reach API: {e}")
                st.stop()

        if data.get("error"):
            st.error(data["error"])
        else:
            col1, col2 = st.columns([3, 2])

            with col1:
                st.subheader("Big Five")
                traits = list(data["personality"].keys())
                values = list(data["personality"].values())

                fig = go.Figure(
                    data=go.Scatterpolar(
                        r=values + [values[0]],
                        theta=traits + [traits[0]],
                        fill="toself",
                        line=dict(color="rgb(99, 110, 250)", width=2),
                    )
                )
                fig.update_layout(
                    polar=dict(radialaxis=dict(visible=True, range=[0, 1])),
                    showlegend=False,
                    height=450,
                    margin=dict(t=30, b=30, l=30, r=30),
                )
                st.plotly_chart(fig, use_container_width=True)

            with col2:
                st.subheader("Scores")
                for trait, score in data["personality"].items():
                    st.metric(trait, f"{score:.2f}")

            st.divider()
            st.subheader("Emotional tone")
            emotion_data = data["emotion"]
            top_emo = max(emotion_data, key=emotion_data.get)
            st.metric(
                "Dominant emotion",
                top_emo.capitalize(),
                f"{emotion_data[top_emo]:.2f}",
            )

            for emo, score in sorted(emotion_data.items(), key=lambda kv: -kv[1]):
                st.progress(score, text=f"{emo}: {score:.2f}")

            with st.expander("Raw response"):
                st.json(data)