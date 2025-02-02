import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time

def get_product_links(base_url, category_path):
    """
    Fetches all product links from a given category page.
    """
    url = base_url + category_path
    response = requests.get(url)
    response.raise_for_status()  # Raise an exception for bad status codes

    soup = BeautifulSoup(response.content, 'html.parser')
    product_links = []

    # Find product links on the current page
    for product_div in soup.find_all('div', class_='grid-product__content'):
        link_element = product_div.find('a', class_='grid-product__link')
        if link_element:
            product_links.append(base_url + link_element['href'])

    return product_links

def scrape_product_page(driver, url):
    """
    Scrapes details from a single product page, including part variations.
    """
    driver.get(url)
    
    # Wait for the dynamic content to load (adjust timeout as needed)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "product-single__title"))
    )

    soup = BeautifulSoup(driver.page_source, 'html.parser')

    product_data = {}

    # Extract product name
    name_element = soup.find('h1', class_='product-single__title')
    product_data['name'] = name_element.text.strip() if name_element else None

    # Extract description
    description_element = soup.find('div', class_='product-single__description')
    product_data['description'] = description_element.text.strip() if description_element else None

    # Extract image link
    image_element = soup.find('img', class_='product-featured-img')
    product_data['image_link'] = 'https:' + image_element['src'] if image_element and image_element.has_attr('src') else None
    
    # Extract part variations using Selenium (if available)
    product_data['variations'] = []
    try:
        # Find the dropdown or element containing variations (update selector as needed)
        variation_select_element = driver.find_element(By.XPATH, "//select[contains(@id, 'SingleOptionSelector')]")
        select = Select(variation_select_element)

        for option in select.options:
            variation_text = option.text.strip()
            if variation_text:
                product_data['variations'].append(variation_text)
                
    except Exception as e:
        # No variation dropdown found or other error
        print(f"Variations not found or error: {e}")
        pass

    return product_data

def main():
    base_url = 'https://wcproducts.com'
    all_products_path = '/collections/viewall'
    output_file = 'wcp_products.json'

    # Set up Selenium WebDriver (make sure you have ChromeDriver installed and in your PATH)
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode (no browser window)
    driver = webdriver.Chrome(options=chrome_options)

    try:
        product_links = get_product_links(base_url, all_products_path)
        all_products_data = []

        for link in product_links:
            print(f"Scraping: {link}")
            try:
                product_data = scrape_product_page(driver, link)
                all_products_data.append(product_data)
            except Exception as e:
                print(f"Error scraping {link}: {e}")
                # Consider more specific error handling or logging here
            time.sleep(1)  # Add a small delay to avoid overloading the server

        # Save data to JSON file
        with open(output_file, 'w') as f:
            json.dump(all_products_data, f, indent=4)

        print(f"Data saved to {output_file}")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching product links: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()