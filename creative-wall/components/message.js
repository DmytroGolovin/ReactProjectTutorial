export default function Message({ children, avatar, userName, description }){
    return (
        <div className="bg-white p-8 border-b-2 rounded-lg shadow-md mb-4">
            <div className="flex items-center gap-2">
                <img src={avatar} className="w-10 rounded-full" />
                <h2>{userName}</h2>
            </div>
            <div className="py-4">
                <p>{description}</p>
            </div>
            {children}
        </div>
    )
}