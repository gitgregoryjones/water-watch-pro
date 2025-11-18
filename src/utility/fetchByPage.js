import api from "./api";

export default async function fetchByPage(url, page = 1, pageSize = 250) {
    try {
        let rows = [];
        let currentPage = page;
        let fetchedPageCount = 0;
        const maxPages = 20; // Safety limit to prevent infinite loops

        console.log(`Starting paginated fetch from: ${url}`);

        while (currentPage <= maxPages) {
            try {
                console.log(`Fetching page ${currentPage}...`);
                
                const response = await api.get(url, {
                    params: {
                        page: currentPage,
                        page_size: pageSize
                    }
                });

                // Validate response
                if (!response.data || !Array.isArray(response.data)) {
                    console.warn(`Invalid response data on page ${currentPage}:`, response.data);
                    break;
                }

                const pageData = response.data;
                console.log(`Page ${currentPage}: got ${pageData.length} items`);

                // Safety check: if we get an empty page, we're done
                if (pageData.length === 0) {
                    console.log(`Page ${currentPage} is empty, stopping.`);
                    break;
                }

                // Check for duplicates (simple check on first item)
                /*if (rows.length > 0 && pageData.length > 0) {
                    const lastRowId = rows[rows.length - 1].id;
                    const firstNewRowId = pageData[0].id;
                    if (lastRowId === firstNewRowId) {
                        console.warn(`Duplicate data detected on page ${currentPage}, stopping.`);
                        break;
                    }
                }*/

                // Add the page data
                rows = rows.concat(pageData);
                fetchedPageCount++;

                // Check if we should fetch more pages
                const totalPages = parseInt(response.headers['x-total-pages'], 10);
                const totalCount = parseInt(response.headers['x-total-count'], 10);
                
                console.log(`Page ${currentPage} headers:`, {
                    totalPages,
                    totalCount,
                    currentRows: rows.length
                });

                // Stop conditions
                if (totalPages && currentPage >= totalPages) {
                    console.log(`Reached last page (${currentPage}/${totalPages}), stopping.`);
                    break;
                }

                if (totalCount && rows.length >= totalCount) {
                    console.log(`Fetched all ${totalCount} items, stopping.`);
                    break;
                }

                // If we got fewer items than page size, we're probably on the last page
                if (pageData.length < pageSize) {
                    console.log(`Page ${currentPage} has only ${pageData.length} items (less than page size ${pageSize}), stopping.`);
                    break;
                }

                currentPage++;

            } catch (pageError) {
                console.error(`Error fetching page ${currentPage}:`, pageError);
                break; // Stop on any page error
            }
        }

        console.log(`Completed: fetched ${rows.length} total items across ${fetchedPageCount} pages`);
        
        // Final validation
        const uniqueIds = new Set(rows.map(item => item.id));
        if (uniqueIds.size !== rows.length) {
            console.warn(`DUPLICATES DETECTED: ${rows.length - uniqueIds.size} duplicate items in final dataset`);
            // Remove duplicates by id
            const uniqueRows = [];
            const seenIds = new Set();
            for (const row of rows) {
                if (!seenIds.has(row.id)) {
                    seenIds.add(row.id);
                    //uniqueRows.push(row);
                }
                uniqueRows.push(row);
            }
            console.log(`Removed duplicates, returning ${uniqueRows.length} unique items`);
            return uniqueRows;
        }

        return rows;

    } catch (error) {
        console.error("Critical error in fetchByPage:", error);
        return [];
    }
}