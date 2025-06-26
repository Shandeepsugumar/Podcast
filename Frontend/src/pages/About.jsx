import './About.css';

const About = () => {
    return (
        <div className="about-container">
            <h1>About Podcast Library</h1>
            <p>
                <strong>Podcast Library</strong> is your one-stop destination to discover, listen, and manage your favorite podcasts. Whether you're a podcast enthusiast or just getting started, our platform makes it easy to explore trending shows, save favorites, and enjoy a seamless listening experience.
            </p>
            <h2>Key Features</h2>
            <ul>
                <li>🎧 Browse and search thousands of podcasts by category or keyword</li>
                <li>❤️ Save your favorite podcasts and episodes for quick access</li>
                <li>▶️ Built-in audio player with now playing and playlist support</li>
                <li>🔍 Discover trending and featured shows</li>
                <li>⭐ Subscribe to podcasts and manage your library</li>
                <li>📱 Responsive design for listening on any device</li>
            </ul>
            <p className="about-footer">
                Made with <span className="about-highlight">passion</span> for podcast lovers.<br/>
                <span className="about-italic">Happy listening!</span>
            </p>
        </div>
    )
}

export default About