import { useState, useEffect } from 'react';

interface CatFact {
    id: number;
    fact: string;
    createdAt: string;
};

const FactsPage = () => {

    const [factsPage, setFactsPage] = useState<number>(1); // Determines which facts to display
    const [facts, setFacts] = useState<CatFact[]>([]); // Stores the facts from the current page
    const [newFact, setNewFact] = useState<string>(''); // Concerns the fact the user is trying to add
    const [factsNumber, setFactsNumber] = useState<number>(0); // Total number of facts in the database

    // Hardcoded constants
    const factsLimit = 5; // Number of facts to display per page

    // When the page first loads, fetch cat facts from our API
    useEffect(() => {
        const fetchFacts = async () => {
            const response = await fetch(`/catfacts?page=${factsPage}&limit=${factsLimit}`);
            const data = await response.json();
            setFacts(data.map((fact: any) => {
                return {
                    id: fact.id,
                    fact: fact.fact,
                    createdAt: fact.created_at
                }
            }));
        };

        const fetchFactsCount = async () => {
            const response = await fetch('/catfacts/count');
            const data = await response.json();
            setFactsNumber(data.count);
        };
        
        fetchFacts();
        fetchFactsCount();
    }, [factsPage]);

    // When the user submits a new fact, add it to the database
    const handleSubmit = async (_e: React.FormEvent) => {
        const response = await fetch('/catfacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fact: newFact })
        });

        // The POST route will return a message indicating success or failure
        const message = (await response.json()).message;
        console.log(message);
    };

    return (
        <div className="FactsPage-container">
            <h1>Cat Facts</h1>

            <div className="facts-display">

                {/* Display Cat Facts */}
                <h2 className="facts-header">The Facts</h2>
                <div className='facts-container'>
                    
                    <ul>
                        {facts.map((fact) => {
                            return (
                                <li key={fact.id}>
                                <p>{fact.fact}</p>
                                <small>Added on: {fact.createdAt} </small>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Pagination Controls */}
                <div className="pagination-container">
                    <button onClick={() => setFactsPage(factsPage - 1)} disabled={factsPage <= 1}>Previous</button>
                    <span> Page {factsPage} </span>
                    <button onClick={() => setFactsPage(factsPage + 1)} disabled={factsLimit*(factsPage+1) - (factsLimit-1) > factsNumber}>Next</button>
                </div>

            </div>
            
            <div className='add-fact-container'>
                <h2 className="facts-header">Add a New Fact</h2>
                <form onSubmit={handleSubmit} className="add-fact-form">
                    <input
                    type="text"
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                    placeholder="Enter a new cat fact"
                    />
                    <button type="submit">Add Fact</button>
                </form>
            </div>
        </div>
    );
};

export default FactsPage;
