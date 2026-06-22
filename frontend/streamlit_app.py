"""
Personality Analyzer — Streamlit UI

Two tabs:
- Analyze: paste text → Big Five + emotion
- Recommendations: get personality-matched books/films/music/activities
"""
import streamlit as st
import requests
import plotly.graph_objects as go

API_URL = st.secrets.get("API_URL", "http://127.0.0.1:8001")

st.set_page_config(page_title="Personality Analyzer", page_icon="🧠", layout="wide")

st.title("AI Personality Analyzer")
st.caption("Big Five personality + emotional tone + personalized recommendations, from your writing.")

# --- Sidebar ---
with st.sidebar:
    st.header("About")
    st.markdown(
        """
        Estimates **Big Five** traits from your writing, then recommends
        books, films, music, or activities tuned to your profile.

        **Models**
        - Personality: `Minej/bert-base-personality`
        - Emotion: `j-hartmann/emotion-english-distilroberta-base`
        - Recommendations: Groq + Llama 3.1 8B over a curated knowledge base

        **Caveats**
        - Estimates are probabilistic, not diagnostic.
        - Short or non-English text reduces accuracy.
        - Best with 100+ words of natural prose.
        """
    )

# --- Session state ---
if "personality" not in st.session_state:
    st.session_state.personality = None
if "emotion" not in st.session_state:
    st.session_state.emotion = None
if "rec_history" not in st.session_state:
    st.session_state.rec_history = {}

# --- Tabs ---
tab_analyze, tab_recommend, tab_apply = st.tabs([
    "🧠 Analyze",
    "✨ Recommendations",
    "💡 Apply to my life",
])

# ============================================================
# TAB 1: Analyze
# ============================================================
with tab_analyze:
    text = st.text_area(
        "Paste a paragraph or writing sample",
        height=220,
        placeholder="Journal entry, blog post, long message — anything where you wrote naturally.",
        key="analyze_text_input",
    )

    if st.button("Analyze", type="primary", key="analyze_btn"):
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
                st.session_state.personality = data["personality"]
                st.session_state.emotion = data["emotion"]
                st.session_state.rec_history = {}

                col1, col2 = st.columns([3, 2])
                with col1:
                    st.subheader("Big Five")
                    traits = list(data["personality"].keys())
                    values = list(data["personality"].values())
                    fig = go.Figure(data=go.Scatterpolar(
                        r=values + [values[0]],
                        theta=traits + [traits[0]],
                        fill="toself",
                        line=dict(color="rgb(99, 110, 250)", width=2),
                    ))
                    fig.update_layout(
                        polar=dict(radialaxis=dict(visible=True, range=[0, 1])),
                        showlegend=False, height=450,
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
                st.metric("Dominant emotion", top_emo.capitalize(),
                          f"{emotion_data[top_emo]:.2f}")
                for emo, score in sorted(emotion_data.items(), key=lambda kv: -kv[1]):
                    st.progress(score, text=f"{emo}: {score:.2f}")

                st.success("✅ Now head over to the **Recommendations** tab!")


# ============================================================
# TAB 2: Recommendations
# ============================================================
with tab_recommend:
    if not st.session_state.personality:
        st.info("👈 First analyze a writing sample in the **Analyze** tab.")
    else:
        st.markdown("Pick a medium and we'll recommend three picks tuned to your profile.")

        col_m, col_mood = st.columns([1, 1])
        with col_m:
            medium = st.selectbox(
                "Medium",
                options=["books", "films", "music", "activities"],
                format_func=lambda x: {
                    "books": "Books",
                    "films": "Films",
                    "music": "Music",
                    "activities": "Activities",
                }[x],
                key="rec_medium",
            )
        with col_mood:
            mood = st.selectbox(
                "Mood (optional)",
                options=[None, "reflective", "uplifting", "intense", "playful"],
                format_func=lambda x: "— Any —" if x is None else x.capitalize(),
                key="rec_mood",
            )

        col_btn1, col_btn2 = st.columns([1, 1])
        with col_btn1:
            get_recs = st.button("Get recommendations", type="primary", key="rec_btn")
        with col_btn2:
            show_more = st.button("Show me different ones", key="rec_more_btn")

        if get_recs or show_more:
            if show_more:
                exclude = st.session_state.rec_history.get(medium, [])
            else:
                exclude = []
                st.session_state.rec_history[medium] = []

            with st.spinner("Picking three for you..."):
                try:
                    res = requests.post(
                        f"{API_URL}/recommend",
                        json={
                            "personality": st.session_state.personality,
                            "medium": medium,
                            "mood": mood,
                            "exclude_ids": exclude,
                        },
                        timeout=120,
                    )
                    rec_data = res.json()
                except requests.exceptions.RequestException as e:
                    st.error(f"Could not reach API: {e}")
                    st.stop()

            if rec_data.get("error"):
                st.error(rec_data["error"])
            elif not rec_data.get("recommendations"):
                st.warning("No recommendations returned. Try a different mood or medium.")
            else:
                new_ids = [r["id"] for r in rec_data["recommendations"]]
                st.session_state.rec_history.setdefault(medium, []).extend(new_ids)

                st.divider()
                for i, rec in enumerate(rec_data["recommendations"], 1):
                    meta = rec.get("metadata", {})
                    with st.container(border=True):
                        cols = st.columns([4, 1])
                        with cols[0]:
                            st.subheader(f"{i}. {rec['title']}")
                            subline_parts = []
                            if meta.get("author"):
                                subline_parts.append(f"by {meta['author']}")
                            if meta.get("artist"):
                                subline_parts.append(f"by {meta['artist']}")
                            if meta.get("year"):
                                subline_parts.append(str(meta["year"]))
                            if meta.get("category"):
                                subline_parts.append(meta["category"])
                            if subline_parts:
                                st.caption(" · ".join(subline_parts))
                        with cols[1]:
                            if meta.get("source_url"):
                                st.markdown(f"[🔗 source]({meta['source_url']})")

                        st.markdown(f"**Why:** {rec['why']}")

                        if rec.get("trait_drivers"):
                            badges = " ".join(f"`{t}`" for t in rec["trait_drivers"])
                            st.markdown(f"**Driven by:** {badges}")

                        with st.expander("More details"):
                            detail_lines = []
                            if meta.get("category"):
                                detail_lines.append(f"**Category:** {meta['category'].replace('_', ' ').title()}")
                            if meta.get("social_level"):
                                detail_lines.append(f"**Social level:** {meta['social_level'].replace('_', ' ').title()}")
                            if meta.get("energy_level"):
                                detail_lines.append(f"**Energy:** {meta['energy_level'].title()}")
                            if meta.get("indoor_outdoor"):
                                detail_lines.append(f"**Setting:** {meta['indoor_outdoor'].title()}")
                            if meta.get("time_commitment"):
                                detail_lines.append(f"**Time:** {meta['time_commitment']}")
                            if meta.get("where_to_find"):
                                detail_lines.append(f"**Where to find:** {meta['where_to_find']}")
                            if meta.get("tags"):
                                detail_lines.append(f"**Tags:** {', '.join(meta['tags'])}")
                            if meta.get("genres"):
                                detail_lines.append(f"**Genres:** {', '.join(meta['genres'])}")

                            if detail_lines:
                                st.markdown("\n\n".join(detail_lines))

                            # Personality fit reasoning — the actual interesting thing
                            fit = meta.get("personality_fit", {})
                            if fit.get("reasoning"):
                                st.markdown(f"\n**Why this fits your profile:** {fit['reasoning']}")
                                
# ============================================================
# TAB 3: Apply to my life
# ============================================================
with tab_apply:
    if not st.session_state.personality:
        st.info("👈 First analyze a writing sample in the **Analyze** tab.")
    else:
        st.markdown(
            "Upload an article, paste a URL, or paste text. We'll suggest how its "
            "ideas might apply *to you* given your personality — reflectively, not "
            "prescriptively."
        )

        input_mode = st.radio(
            "Input method",
            ["📄 Upload PDF", "🔗 Paste URL", "📝 Paste text"],
            horizontal=True,
            key="apply_input_mode",
        )

        # We use session_state to persist the extracted text across reruns
        if "apply_article_text" not in st.session_state:
            st.session_state.apply_article_text = None

        if input_mode == "📄 Upload PDF":
            uploaded = st.file_uploader("Upload PDF", type=["pdf"], key="apply_pdf")
            if uploaded and st.button("Extract & analyze", type="primary", key="apply_pdf_btn"):
                with st.spinner("Extracting PDF..."):
                    try:
                        res = requests.post(
                            f"{API_URL}/extract",
                            files={"pdf": (uploaded.name, uploaded.getvalue(), "application/pdf")},
                            timeout=120,
                        )
                        data = res.json()
                    except Exception as e:
                        st.error(f"Extract failed: {e}")
                        st.stop()
                if data.get("error"):
                    st.error(data["error"])
                else:
                    st.session_state.apply_article_text = data["text"]
                    st.success(f"Extracted {data['char_count']:,} characters.")

        elif input_mode == "🔗 Paste URL":
            url = st.text_input("Article URL", placeholder="https://...", key="apply_url")
            if url and st.button("Extract & analyze", type="primary", key="apply_url_btn"):
                with st.spinner("Fetching article..."):
                    try:
                        res = requests.post(
                            f"{API_URL}/extract",
                            data={"url": url},
                            timeout=120,
                        )
                        data = res.json()
                    except Exception as e:
                        st.error(f"Fetch failed: {e}")
                        st.stop()
                if data.get("error"):
                    st.error(data["error"])
                else:
                    st.session_state.apply_article_text = data["text"]
                    st.success(f"Extracted {data['char_count']:,} characters.")

        else:  # paste text
            pasted = st.text_area(
                "Paste article text",
                height=250,
                key="apply_pasted",
                placeholder="Paste an essay, chapter, or article you're reading...",
            )
            if pasted and st.button("Analyze", type="primary", key="apply_text_btn"):
                if len(pasted.strip()) < 200:
                    st.warning("Please paste at least 200 characters.")
                else:
                    st.session_state.apply_article_text = pasted

        # If we have article text, call the apply endpoint
        if st.session_state.apply_article_text:
            with st.spinner("Reflecting on how this applies to you..."):
                try:
                    res = requests.post(
                        f"{API_URL}/apply-to-life",
                        json={
                            "personality": st.session_state.personality,
                            "article_text": st.session_state.apply_article_text,
                        },
                        timeout=180,
                    )
                    apply_data = res.json()
                except Exception as e:
                    st.error(f"Could not reach API: {e}")
                    st.stop()

            # Clear so it doesn't auto-re-run on every interaction
            st.session_state.apply_article_text = None

            if apply_data.get("error"):
                st.error(apply_data["error"])
            else:
                st.divider()

                if apply_data.get("summary"):
                    st.subheader("📖 What this article is about")
                    st.write(apply_data["summary"])

                if apply_data.get("takeaways_for_you"):
                    st.subheader("✨ Takeaways for you")
                    for t in apply_data["takeaways_for_you"]:
                        st.markdown(f"- {t}")

                if apply_data.get("where_this_might_be_hard"):
                    st.subheader("⚠️ Where this might feel hard")
                    for h in apply_data["where_this_might_be_hard"]:
                        st.markdown(f"- {h}")

                if apply_data.get("reflection_questions"):
                    st.subheader("🤔 Questions to sit with")
                    for q in apply_data["reflection_questions"]:
                        st.markdown(f"- {q}")

                if apply_data.get("caveat"):
                    st.info(f"ℹ️ {apply_data['caveat']}")