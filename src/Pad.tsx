const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function Pad() {
    return (
        <>
            {numbers.map((number) => (
                <button 
                    key={number}
                    onClick={() => {console.log(number)}}
                >
                    {number}
                </button>
            ))}
        </>
    );
}

export default Pad;