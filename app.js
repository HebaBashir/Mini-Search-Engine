const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

let articles = [];


if (fs.existsSync('data.json')) {
    articles = JSON.parse(fs.readFileSync('data.json', 'utf8'));
}

const saveArticles = () => {
    fs.writeFileSync('data.json', JSON.stringify(articles, null, 2));
};

// Endpoint: Add Article
app.post('/articles', (req, res) => {
    const { title, content, tags } = req.body;
    if (!title || !content || !tags) {
        return res.status(400).json({ error: 'Title, content, and tags are required.' });
    }
    
    const newArticle = {
        id: articles.length + 1,
        title,
        content,
        tags,
        date: new Date()
    };
    
    articles.push(newArticle);
    saveArticles();
    
    res.status(201).json(newArticle);
});

// Endpoint: Search Articles
app.get('/articles/search', (req, res) => {
    const { keyword, tag, sortBy } = req.query;
    let results = articles;

    if (keyword) {
        results = results.filter(article => 
            article.title.includes(keyword) || article.content.includes(keyword)
        );
    }

    if (tag) {
        results = results.filter(article => article.tags.includes(tag));
    }

    // Sorting
    if (keyword && sortBy === 'relevance') {
        results.sort((a, b) => {
            const freqA = (a.title.match(new RegExp(keyword, 'gi')) || []).length +
                          (a.content.match(new RegExp(keyword, 'gi')) || []).length;
            const freqB = (b.title.match(new RegExp(keyword, 'gi')) || []).length +
                          (b.content.match(new RegExp(keyword, 'gi')) || []).length;
            return freqB - freqA;
        });
    } else if (sortBy === 'date') {
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    res.json(results);
});

// Endpoint: Get Article by ID
app.get('/articles/:id', (req, res) => {
    const article = articles.find(a => a.id === parseInt(req.params.id));
    if (!article) {
        return res.status(404).json({ error: 'Article not found.' });
    }
    res.json(article);
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
