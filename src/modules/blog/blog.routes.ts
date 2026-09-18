import { buildCrudRouter } from "../../common/crudRouter";
import { JsonFileRepository } from "../../db/JsonFileRepository";
import {
  createBlogCategorySchema,
  createBlogPostSchema,
  updateBlogCategorySchema,
  updateBlogPostSchema,
} from "./blog.schema";
import { BlogCategory, BlogPost } from "./blog.types";

export const blogPostsRepository = new JsonFileRepository<BlogPost>("blog-posts");
export const blogCategoriesRepository = new JsonFileRepository<BlogCategory>("blog-categories");

/**
 * Mounted at /api/v1/blog-posts.
 * @openapi
 * /blog-posts:
 *   get:
 *     tags: [Blog]
 *     summary: List published posts (public) or all posts (admin)
 *     responses:
 *       200: { description: List of posts }
 *   post:
 *     tags: [Blog]
 *     summary: "Admin: create a post"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 * /blog-posts/{id}:
 *   patch:
 *     tags: [Blog]
 *     summary: "Admin: edit a post"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Blog]
 *     summary: "Admin: delete a post"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 * /blog-posts/{id}/publish:
 *   patch:
 *     tags: [Blog]
 *     summary: "Admin: publish a post"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Published }
 * /blog-posts/{id}/unpublish:
 *   patch:
 *     tags: [Blog]
 *     summary: "Admin: unpublish a post (hide it again)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Unpublished }
 */
export const blogPostsRouter = buildCrudRouter<BlogPost>({
  repository: blogPostsRepository,
  createSchema: createBlogPostSchema,
  updateSchema: updateBlogPostSchema,
  publicListFilter: (post) => post.isPublished,
  statusActions: [
    { action: "publish", patch: { isPublished: true, publishedAt: new Date().toISOString() } },
    { action: "unpublish", patch: { isPublished: false } },
  ],
});

/**
 * Mounted at /api/v1/blog-categories.
 * @openapi
 * /blog-categories:
 *   get:
 *     tags: [Blog]
 *     summary: List blog categories
 *     responses:
 *       200: { description: List of categories }
 *   post:
 *     tags: [Blog]
 *     summary: "Admin: add a category"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 * /blog-categories/{id}:
 *   patch:
 *     tags: [Blog]
 *     summary: "Admin: edit a category"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Blog]
 *     summary: "Admin: remove a category"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
export const blogCategoriesRouter = buildCrudRouter<BlogCategory>({
  repository: blogCategoriesRepository,
  createSchema: createBlogCategorySchema,
  updateSchema: updateBlogCategorySchema,
  publicListFilter: () => true,
});
