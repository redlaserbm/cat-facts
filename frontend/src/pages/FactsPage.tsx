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

    // Determines how many facts to display per pag
    const [factsLimit, setFactsLimit] = useState<number>(5); // Number of facts to display per page

    // This is where the API is hosted.
    const serverPrefix = import.meta.env.VITE_API_URL || '';
    console.log(`Server prefix is: ${serverPrefix}`);

    useEffect(() => {

        console.log('Setting up resize event listener.');

        const handleResize = () => {
            // Reduce the facts limit if the viewport is short
            if (window.innerHeight < 1000) {
                setFactsLimit(1);
            } else {
                setFactsLimit(5);
            }
        };

        handleResize(); 
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    },[]);

    // Whenever factsLimit changes, we should update factsPage to a reasonable value
    useEffect(() =>{
        if (factsLimit === 5) {
            // The old factsLimit was 1
            setFactsPage(Math.floor(factsPage / factsLimit) + 1);
        } else {
            // The old factsLimit was 5
            setFactsPage(5 * (factsPage - 1) + 1);
        }
    },[factsLimit])

    // In some cases when factsNumber changes, we need to step backwards a page
    useEffect(() => {
        if (factsLimit * (factsPage - 1) + 1 > factsNumber) {
            setFactsPage(Math.max(factsPage - 1, 1));
        }
    }, [factsNumber]);

    // Fetch cat facts from our API
    useEffect(() => {
        console.log(`Fetching facts for page ${factsPage} with limit ${factsLimit}.`);
        const fetchFacts = async () => {
            const response = await fetch(`${serverPrefix}/catfacts?page=${factsPage}&limit=${factsLimit}`);
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
            const response = await fetch(`${serverPrefix}/catfacts/count`);
            const data = await response.json();
            setFactsNumber(data.count);
        };
        
        fetchFacts();
        fetchFactsCount();
    }, [factsPage, factsLimit, factsNumber]);

    // When the user submits a new fact, add it to the database
    const handleSubmit = async (e: React.FormEvent) => {
        
        e.preventDefault(); // Prevent the page from refreshing
        setFactsNumber(factsNumber + 1); // Increment the number of facts in the database
        setNewFact('');

        const response = await fetch(`${serverPrefix}/catfacts`, {
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

    // When the user click the delete button corresponding to a fact, delete it from the database
    const handleDelete = async (id: number) => {
        const response = await fetch(`${serverPrefix}/catfacts/${id}`, {
            method: 'DELETE'
        });

        setFactsNumber(factsNumber - 1); // Decrement the number of facts in the database

        // The DELETE route will return a message indicating success or failure
        const message = (await response.json()).message;
        console.log(message);
    }

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
                                    <div className="fact-div">
                                        <p>{fact.fact}</p>
                                        <button onClick={() => handleDelete(fact.id)}>Delete</button>
                                    </div>
                                    <small className="fact-metadata">Added on: {fact.createdAt} </small>
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
