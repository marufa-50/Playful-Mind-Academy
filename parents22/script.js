body {
    font-family: 'Comic Sans MS', cursive, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #C8E6C9;
    background-image: url('https://mistralaiblackforestprod.blob.core.windows.net/images/blackforest/3f1b/f584/-00f/5-4597-9cac-f4790ee445ce/image.jpg?se=2025-12-20T14%3A16%3A58Z&sp=r&sv=2025-01-05&sr=b&sig=swAA1jDH7aTOIH46oAXV44OS2yn3Uwuh3nHTb7SmDGg%3D');
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    color: #5D4037;
    min-height: 100vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: rgba(139, 195, 74, 0.8);
    color: white;
    border-radius: 0 0 20px 20px;
}

.back-btn, .subscribe-btn {
    background-color: #FFD700;
    color: #5D4037;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
}

.back-btn:hover, .subscribe-btn:hover {
    background-color: #FFC107;
}

.container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 20px;
}

.card {
    background-color: rgba(255, 255, 255, 0.8);
    border: 3px solid #FFD700;
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.3s;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.card:hover {
    transform: scale(1.05);
}

.card img {
    max-width: 100%;
    max-height: 120px;
    border-radius: 10px;
    margin-top: 10px;
}

.card h2 {
    margin: 0;
    color: #FF8C00;
    font-size: 18px;
}

.sunflower {
    position: absolute;
    width: 50px;
    height: 50px;
}

.sunflower:nth-child(1) {
    top: 10%;
    left: 5%;
}

.sunflower:nth-child(2) {
    top: 10%;
    right: 5%;
}
