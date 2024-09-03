const events = new Map([
    [
        0,
        {
            id: 0,
            name: 'Gallery',
            description: '',
            date: '',
            location: '',
            primary_image: ''
        }
    ],
    [
        1,
        {
            id: 1,
            name: '2024 Fall Crop',
            description: 'Crafting crops raising money for Multiple Sclerosis research',
            date: 'September 6-7, 2024',
            location: 'Wild Rose Casino, 777 Wild Rose Dr, Clinton, IA 52732',
            primary_image: 'https://scontent.find1-1.fna.fbcdn.net/v/t39.30808-6/434262231_808813901288730_2383296708988799290_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_ohc=BQ2ac78qmrUQ7kNvgFkx96F&_nc_ht=scontent.find1-1.fna&oh=00_AYDuzChVKvoy2aXL1XQyzWY5jBiSCPUQOr3LlwdRwDEdIA&oe=66DBFFAE',
            colors: {
                primary: '#f15405',
                primary_text: 'black',
                secondary: '#cccccc',
                secondary_text: 'black',
                surface: 'black',
                surface_text: 'white'
            }
        }
    ]
])

/**
 * @param {URL} url
 */
function getEvent(url) {
    const event = events.get(Number(url.searchParams.get('e') || 0))
    return event
}
export {getEvent}